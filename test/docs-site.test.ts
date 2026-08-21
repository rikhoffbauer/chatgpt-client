import assert from 'node:assert/strict'
import { open, opendir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import test from 'node:test'

const repoRoot = process.cwd()
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

async function readRepoFile(relativePath: string): Promise<string> {
  return readFile(join(repoRoot, relativePath), 'utf8')
}

async function readJson(relativePath: string): Promise<Record<string, unknown>> {
  return JSON.parse(await readRepoFile(relativePath)) as Record<string, unknown>
}

async function readBoundedFile(path: string, maximumBytes: number): Promise<Buffer> {
  const handle = await open(path, 'r')
  try {
    const contents = Buffer.alloc(maximumBytes + 1)
    const { bytesRead } = await handle.read(contents, 0, contents.length)
    assert.ok(bytesRead <= maximumBytes, path + ' exceeds ' + maximumBytes + ' bytes')
    return contents.subarray(0, bytesRead)
  } finally {
    await handle.close()
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
  assert.match(contentConfig, /pattern:\s*PUBLIC_DOC_PATTERNS/)
  assert.match(contentConfig, /base:\s*['"]\.\.\/docs['"]/)
  assert.match(astroConfig, /entryPoints:\s*\[\s*['"]\.\.\/src\/index\.ts['"]\s*\]/)
})

test('documentation workflow configures, uploads, and deploys GitHub Pages', async () => {
  const workflow = await readRepoFile('.github/workflows/docs.yml')

  assert.match(workflow, /actions\/configure-pages@/)
  assert.match(workflow, /actions\/upload-pages-artifact@/)
  assert.match(workflow, /actions\/deploy-pages@/)
})

test('built website never contains the internal design marker', async (context) => {
  const distPath = join(repoRoot, 'website', 'dist')
  try {
    await opendir(distPath).then((directory) => directory.close())
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      context.skip('website/dist does not exist before a documentation build')
      return
    }
    throw error
  }

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
      if (entry.isDirectory()) {
        directories.push(path)
        continue
      }
      if (!entry.isFile()) continue
      const contents = await readBoundedFile(path, MAX_DIST_FILE_BYTES)
      totalBytes += contents.length
      assert.ok(totalBytes <= MAX_DIST_TOTAL_BYTES, 'website/dist exceeds ' + MAX_DIST_TOTAL_BYTES + ' bytes')
      assert.equal(contents.includes(marker), false, path)
    }
  }
})
