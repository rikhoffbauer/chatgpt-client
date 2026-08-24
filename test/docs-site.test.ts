import assert from 'node:assert/strict'
import { constants } from 'node:fs'
import { lstat, mkdir, mkdtemp, open, opendir, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

const repoRoot = process.cwd()
const MAX_REPO_FILE_BYTES = 1024 * 1024
const MAX_DIST_ENTRIES = 50_000
const MAX_DIST_FILE_BYTES = 5 * 1024 * 1024
const MAX_DIST_TOTAL_BYTES = 100 * 1024 * 1024
const approvedPlugins = [
  'starlight-copy-button',
  'starlight-dot-md',
  'starlight-links-validator',
  'starlight-llms-txt',
  'starlight-typedoc',
]

const requiredPublicDocs = [
  'docs/index.mdx',
  'docs/getting-started/installation.md',
  'docs/getting-started/library-quick-start.md',
  'docs/getting-started/cli-quick-start.md',
  'docs/guides/authentication-configuration.md',
  'docs/guides/conversations-streaming.md',
  'docs/guides/files.md',
  'docs/guides/app-server.md',
  'docs/guides/cancellation-limits.md',
  'docs/reference/cli.md',
  'docs/reference/environment.md',
  'docs/project/architecture.md',
  'docs/project/security.md',
  'docs/project/development.md',
]

async function readRepoFile(relativePath: string): Promise<string> {
  return (await readBoundedFile(join(repoRoot, relativePath), MAX_REPO_FILE_BYTES)).toString('utf8')
}

async function readJson(relativePath: string): Promise<Record<string, unknown>> {
  return JSON.parse(await readRepoFile(relativePath)) as Record<string, unknown>
}

async function readBoundedFile(path: string, maximumBytes: number): Promise<Buffer> {
  const metadata = await lstat(path)
  assert.equal(metadata.isFile(), true, path + ' must be a regular file')
  const handle = await open(path, constants.O_RDONLY | constants.O_NONBLOCK)
  try {
    const contents = Buffer.alloc(maximumBytes + 1)
    let totalBytes = 0
    while (totalBytes < contents.length) {
      const { bytesRead } = await handle.read(contents, totalBytes, contents.length - totalBytes)
      if (bytesRead === 0) break
      totalBytes += bytesRead
    }
    assert.ok(totalBytes <= maximumBytes, path + ' exceeds ' + maximumBytes + ' bytes')
    return contents.subarray(0, totalBytes)
  } finally {
    await handle.close()
  }
}

type BuiltArtifactEntry = {
  isDirectory(): boolean
  isFile(): boolean
  isSymbolicLink(): boolean
}

function classifyBuiltArtifactEntry(entry: BuiltArtifactEntry, path: string): 'directory' | 'file' {
  assert.equal(entry.isSymbolicLink(), false, path + ' must not be a symlink')
  if (entry.isDirectory()) return 'directory'
  assert.equal(entry.isFile(), true, path + ' must be a regular file or directory')
  return 'file'
}

async function assertBuiltWebsiteBoundary(distPath: string): Promise<void> {
  const distMetadata = await lstat(distPath)
  assert.equal(distMetadata.isSymbolicLink(), false, distPath + ' must not be a symlink')
  assert.equal(distMetadata.isDirectory(), true, distPath + ' must be a directory')

  const marker = Buffer.from('Approved for implementation planning')
  const directories = [distPath]
  let entryCount = 0
  let totalBytes = 0
  while (directories.length > 0) {
    const directoryPath = directories.pop() as string
    const directory = await opendir(directoryPath)
    for await (const entry of directory) {
      entryCount += 1
      assert.ok(entryCount <= MAX_DIST_ENTRIES, 'website/dist exceeds ' + MAX_DIST_ENTRIES + ' entries')
      const path = join(directoryPath, entry.name)
      if (classifyBuiltArtifactEntry(entry, path) === 'directory') {
        directories.push(path)
        continue
      }
      const contents = await readBoundedFile(path, MAX_DIST_FILE_BYTES)
      totalBytes += contents.length
      assert.ok(totalBytes <= MAX_DIST_TOTAL_BYTES, 'website/dist exceeds ' + MAX_DIST_TOTAL_BYTES + ' bytes')
      assert.equal(contents.includes(marker), false, path)
    }
  }
}

test('root package delegates documentation commands to the website package', async () => {
  const packageJson = await readJson('package.json')
  const scripts = packageJson.scripts as Record<string, string>

  assert.deepEqual(
    Object.fromEntries(['docs:dev', 'docs:check', 'docs:build', 'docs:serve'].map((name) => [name, scripts[name]])),
    {
      'docs:dev': 'npm --prefix website run dev',
      'docs:check': 'npm --prefix website run check',
      'docs:build': 'npm --prefix website run build',
      'docs:serve': 'npm --prefix website run serve',
    },
  )
})

test('public documentation provides the complete reader journey', async () => {
  for (const relativePath of requiredPublicDocs) {
    const contents = await readRepoFile(relativePath)
    assert.match(contents, /^---\n[\s\S]*?^title:\s*\S.+$/m, relativePath + ' needs a title')
    assert.match(contents, /^---\n[\s\S]*?^description:\s*\S.+$/m, relativePath + ' needs a description')
  }

  await assert.rejects(readRepoFile('docs/architecture.md'), (error: NodeJS.ErrnoException) => error.code === 'ENOENT')
})

test('website package uses exactly the approved Starlight plugins', async () => {
  const packageJson = await readJson('website/package.json')
  const devDependencies = packageJson.devDependencies as Record<string, string>
  const plugins = Object.keys(devDependencies).filter((name) => name.startsWith('starlight-')).sort()

  assert.deepEqual(plugins, approvedPlugins)
})

test('website content and TypeDoc configurations retain repository boundaries', async () => {
  const contentConfig = await readRepoFile('website/src/content.config.ts')
  const astroConfig = await readRepoFile('website/astro.config.mjs')

  assert.match(contentConfig, /import\s+\{\s*PUBLIC_DOC_PATTERNS\s*\}\s+from\s+['"]\.\/lib\/public-docs\.mjs['"]/)
  assert.match(contentConfig, /pattern:\s*(?:PUBLIC_DOC_PATTERNS|\[\.\.\.PUBLIC_DOC_PATTERNS\])/)
  assert.match(contentConfig, /base:\s*['"]\.\.\/docs['"]/)
  assert.match(astroConfig, /entryPoints:\s*\[\s*['"]\.\.\/src\/index\.ts['"]\s*\]/)
  assert.match(astroConfig, /tsconfig:\s*['"]\.\/typedoc\.tsconfig\.json['"]/)

  const typeDocConfig = await readRepoFile('website/typedoc.tsconfig.json')
  assert.match(typeDocConfig, /\"typeRoots\":\s*\[\s*\"\.\/node_modules\/@types\"/)

  const websitePackage = await readJson('website/package.json')
  const websiteDevDependencies = websitePackage.devDependencies as Record<string, string>
  assert.equal(websiteDevDependencies['@types/node'], '25.1.0')
})

test('documentation workflow configures, uploads, and deploys GitHub Pages', async () => {
  const workflow = await readRepoFile('.github/workflows/docs.yml')

  assert.match(workflow, /npm ci --prefix website/)
  assert.match(workflow, /actions\/configure-pages@/)
  assert.match(workflow, /actions\/upload-pages-artifact@/)
  assert.match(workflow, /actions\/deploy-pages@/)
  assert.match(workflow, /build:\n\s+permissions:\n\s+contents:\s+read\n\s+pages:\s+read/)
  assert.match(workflow, /deploy:\n\s+permissions:\n\s+pages:\s+write\n\s+id-token:\s+write/)
  assert.doesNotMatch(workflow.split('jobs:')[0] ?? '', /pages:\s+write|id-token:\s+write/)
})

test('built website boundary rejects a child symlink', async (context) => {
  const root = await mkdtemp(join(tmpdir(), 'chatgpt-dist-boundary-'))
  context.after(() => rm(root, { recursive: true, force: true }))
  const distPath = join(root, 'dist')
  const targetPath = join(root, 'target.txt')
  await mkdir(distPath)
  await writeFile(targetPath, 'external artifact')
  await symlink(targetPath, join(distPath, 'alias.txt'), process.platform === 'win32' ? 'file' : undefined)

  await assert.rejects(assertBuiltWebsiteBoundary(distPath), /must not be a symlink/)
})

test('built website boundary rejects special entries through its pure classifier', () => {
  const specialEntry = {
    isDirectory: () => false,
    isFile: () => false,
    isSymbolicLink: () => false,
  }

  assert.throws(() => classifyBuiltArtifactEntry(specialEntry, 'dist/socket'), /regular file or directory/)
})

test('built website boundary rejects a symlinked dist root', async (context) => {
  const root = await mkdtemp(join(tmpdir(), 'chatgpt-dist-boundary-'))
  context.after(() => rm(root, { recursive: true, force: true }))
  const outside = join(root, 'outside')
  const distPath = join(root, 'website', 'dist')
  await mkdir(outside, { recursive: true })
  await mkdir(join(root, 'website'), { recursive: true })
  await symlink(outside, distPath, process.platform === 'win32' ? 'junction' : 'dir')

  await assert.rejects(assertBuiltWebsiteBoundary(distPath), /must not be a symlink/)
})

test('built website never contains the internal design marker', async (context) => {
  const distPath = join(repoRoot, 'website', 'dist')
  try {
    await assertBuiltWebsiteBoundary(distPath)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      context.skip('website/dist does not exist before a documentation build')
      return
    }
    throw error
  }
})
