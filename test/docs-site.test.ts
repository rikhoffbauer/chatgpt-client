import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import test from 'node:test'

const repoRoot = process.cwd()
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

  assert.match(contentConfig, /import\s+\{\s*PUBLIC_DOC_PATTERNS\s*\}/)
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
  let entries
  try {
    entries = await readdir(distPath, { recursive: true, withFileTypes: true })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      context.skip('website/dist does not exist before a documentation build')
      return
    }
    throw error
  }

  const marker = 'Approved for implementation planning'
  for (const entry of entries) {
    if (!entry.isFile()) continue
    const contents = await readFile(join(entry.parentPath, entry.name), 'utf8')
    assert.doesNotMatch(contents, new RegExp(marker), join(entry.parentPath, entry.name))
  }
})
