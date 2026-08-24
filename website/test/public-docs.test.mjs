import assert from 'node:assert/strict'
import { copyFile, mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { PUBLIC_DOC_PATTERNS, assertPublicDocLinks, assertPublicDocsBoundary, isPublicDoc } from '../src/lib/public-docs.mjs'

const PROCESS_OPTIONS = { encoding: 'utf8', killSignal: 'SIGKILL', maxBuffer: 64 * 1024, timeout: 5_000 }

test('publishes only explicitly approved documentation sections', () => {
  assert.equal(Object.isFrozen(PUBLIC_DOC_PATTERNS), true)
  assert.deepEqual(PUBLIC_DOC_PATTERNS, [
    'index.mdx',
    'getting-started/**/*.{md,mdx}',
    'guides/**/*.{md,mdx}',
    'reference/**/*.{md,mdx}',
    'project/**/*.{md,mdx}',
  ])
  assert.equal(isPublicDoc('index.mdx'), true)
  assert.equal(isPublicDoc('guides/files.md'), true)
  assert.equal(isPublicDoc('guides\\files.mdx'), true)
  assert.equal(isPublicDoc('guides/files.txt'), false)
  assert.equal(isPublicDoc('superpowers/plans/internal.md'), false)
  assert.equal(isPublicDoc('verification.md'), false)
})

test('validates root, relative, and generated API documentation links', () => {
  assert.doesNotThrow(() => assertPublicDocLinks([
    { relativePath: 'index.mdx', contents: '[Guide](/guides/files/) [API](/api/classes/chatgptclient/)' },
    { relativePath: 'guides/files.md', contents: '[Files](./files/)' },
  ]))
})

test('rejects a broken authored documentation link', () => {
  assert.throws(() => assertPublicDocLinks([
    { relativePath: 'index.mdx', contents: '[Missing](/guides/missing/)' },
  ]), /Broken public documentation link/)
})

test('accepts a valid public documentation tree', async (context) => {
  const root = await mkdtemp(join(tmpdir(), 'chatgpt-docs-'))
  context.after(() => rm(root, { recursive: true, force: true }))
  await mkdir(join(root, 'docs', 'guides'), { recursive: true })
  await writeFile(join(root, 'docs', 'index.mdx'), '# Public docs')
  await writeFile(join(root, 'docs', 'guides', 'files.md'), '# Files')
  await assert.doesNotReject(assertPublicDocsBoundary(root))
})

test('rejects a missing public entry page', async (context) => {
  const root = await mkdtemp(join(tmpdir(), 'chatgpt-docs-'))
  context.after(() => rm(root, { recursive: true, force: true }))
  await mkdir(join(root, 'docs'), { recursive: true })
  await assert.rejects(assertPublicDocsBoundary(root), /index\.mdx/)
})

test('rejects an oversized public entry page', async (context) => {
  const root = await mkdtemp(join(tmpdir(), 'chatgpt-docs-'))
  context.after(() => rm(root, { recursive: true, force: true }))
  await mkdir(join(root, 'docs'), { recursive: true })
  await writeFile(join(root, 'docs', 'index.mdx'), Buffer.alloc(1024 * 1024 + 1, 97))
  await assert.rejects(assertPublicDocsBoundary(root), /byte limit/)
})

test('rejects a public document symlink that escapes docs', async (context) => {
  const root = await mkdtemp(join(tmpdir(), 'chatgpt-docs-'))
  context.after(() => rm(root, { recursive: true, force: true }))
  await mkdir(join(root, 'docs', 'guides'), { recursive: true })
  await writeFile(join(root, 'outside.md'), '# secret')
  await symlink(join(root, 'outside.md'), join(root, 'docs', 'guides', 'escape.md'))
  await assert.rejects(assertPublicDocsBoundary(root), /escapes docs/)
})

test('rejects a public symlink alias to internal documentation', async (context) => {
  const root = await mkdtemp(join(tmpdir(), 'chatgpt-docs-'))
  context.after(() => rm(root, { recursive: true, force: true }))
  await mkdir(join(root, 'docs', 'guides'), { recursive: true })
  await mkdir(join(root, 'docs', 'superpowers'), { recursive: true })
  await writeFile(join(root, 'docs', 'index.mdx'), '# Public docs')
  await writeFile(join(root, 'docs', 'superpowers', 'secret.md'), '# Secret')
  await symlink(join(root, 'docs', 'superpowers', 'secret.md'), join(root, 'docs', 'guides', 'leak.md'))
  await assert.rejects(assertPublicDocsBoundary(root), /internal documentation/)
})

test('rejects a public directory symlink alias to internal documentation', async (context) => {
  const root = await mkdtemp(join(tmpdir(), 'chatgpt-docs-'))
  context.after(() => rm(root, { recursive: true, force: true }))
  await mkdir(join(root, 'docs', 'guides'), { recursive: true })
  await mkdir(join(root, 'docs', 'superpowers'), { recursive: true })
  await writeFile(join(root, 'docs', 'index.mdx'), '# Public docs')
  await writeFile(join(root, 'docs', 'superpowers', 'secret.md'), '# Secret')
  await symlink(join(root, 'docs', 'superpowers'), join(root, 'docs', 'guides', 'internal'))
  await assert.rejects(assertPublicDocsBoundary(root), /internal documentation/)
})

test('rejects nested public aliases regardless of traversal order', async (context) => {
  const root = await mkdtemp(join(tmpdir(), 'chatgpt-docs-'))
  context.after(() => rm(root, { recursive: true, force: true }))
  await mkdir(join(root, 'docs'), { recursive: true })
  await symlink(join(root, 'docs', 'guides', 'nested'), join(root, 'docs', 'alias-000'))
  await mkdir(join(root, 'docs', 'guides', 'nested'), { recursive: true })
  await writeFile(join(root, 'docs', 'index.mdx'), '# Public docs')
  await writeFile(join(root, 'docs', 'verification.md'), '# Secret')
  await symlink(join(root, 'docs', 'verification.md'), join(root, 'docs', 'guides', 'nested', 'leak.md'))
  await assert.rejects(assertPublicDocsBoundary(root), /internal documentation/)
})

test('rejects special files without opening them', { skip: process.platform === 'win32' ? 'POSIX FIFO fixture is unavailable on Windows' : false }, async (context) => {
  const root = await mkdtemp(join(tmpdir(), 'chatgpt-docs-'))
  context.after(() => rm(root, { recursive: true, force: true }))
  const sourceRoot = dirname(dirname(fileURLToPath(import.meta.url)))
  await mkdir(join(root, 'website', 'scripts'), { recursive: true })
  await mkdir(join(root, 'website', 'src', 'lib'), { recursive: true })
  await mkdir(join(root, 'docs'), { recursive: true })
  await copyFile(join(sourceRoot, 'scripts', 'check-public-docs.mjs'), join(root, 'website', 'scripts', 'check-public-docs.mjs'))
  await copyFile(join(sourceRoot, 'src', 'lib', 'public-docs.mjs'), join(root, 'website', 'src', 'lib', 'public-docs.mjs'))

  const fifoPath = join(root, 'docs', 'index.mdx')
  const fifoResult = spawnSync('mkfifo', [fifoPath], PROCESS_OPTIONS)
  if (fifoResult.error?.code === 'ENOENT') {
    context.skip('POSIX mkfifo utility is unavailable')
    return
  }
  assert.equal(fifoResult.error, undefined)
  assert.equal(fifoResult.status, 0, fifoResult.stderr)

  const result = spawnSync(process.execPath, [join(root, 'website', 'scripts', 'check-public-docs.mjs')], PROCESS_OPTIONS)
  assert.equal(result.error, undefined)
  assert.equal(result.status, 1)
  assert.match(result.stderr, /regular files or directories/)
})

test('rejects a docs root symlink outside the repository', async (context) => {
  const root = await mkdtemp(join(tmpdir(), 'chatgpt-docs-'))
  const outside = await mkdtemp(join(tmpdir(), 'chatgpt-docs-outside-'))
  context.after(() => Promise.all([rm(root, { recursive: true, force: true }), rm(outside, { recursive: true, force: true })]))
  await writeFile(join(outside, 'index.mdx'), '# External docs')
  await symlink(outside, join(root, 'docs'))
  await assert.rejects(assertPublicDocsBoundary(root), /docs root.*symlink/)
})

test('boundary CLI reports a nonzero exit when public entry content is missing', async (context) => {
  const root = await mkdtemp(join(tmpdir(), 'chatgpt-docs-cli-'))
  context.after(() => rm(root, { recursive: true, force: true }))
  const sourceRoot = dirname(dirname(fileURLToPath(import.meta.url)))
  await mkdir(join(root, 'website', 'scripts'), { recursive: true })
  await mkdir(join(root, 'website', 'src', 'lib'), { recursive: true })
  await mkdir(join(root, 'docs'), { recursive: true })
  await copyFile(join(sourceRoot, 'scripts', 'check-public-docs.mjs'), join(root, 'website', 'scripts', 'check-public-docs.mjs'))
  await copyFile(join(sourceRoot, 'src', 'lib', 'public-docs.mjs'), join(root, 'website', 'src', 'lib', 'public-docs.mjs'))

  const result = spawnSync(process.execPath, [join(root, 'website', 'scripts', 'check-public-docs.mjs')], PROCESS_OPTIONS)
  assert.equal(result.error, undefined)
  assert.equal(result.status, 1)
  assert.match(result.stderr, /index\.mdx/)
})

test('boundary CLI resolves the repository from import.meta.url and prints one success line', async (context) => {
  const root = await mkdtemp(join(tmpdir(), 'chatgpt-docs-cli-'))
  context.after(() => rm(root, { recursive: true, force: true }))
  const sourceRoot = dirname(dirname(fileURLToPath(import.meta.url)))
  await mkdir(join(root, 'website', 'scripts'), { recursive: true })
  await mkdir(join(root, 'website', 'src', 'lib'), { recursive: true })
  await mkdir(join(root, 'docs'), { recursive: true })
  await copyFile(join(sourceRoot, 'scripts', 'check-public-docs.mjs'), join(root, 'website', 'scripts', 'check-public-docs.mjs'))
  await copyFile(join(sourceRoot, 'src', 'lib', 'public-docs.mjs'), join(root, 'website', 'src', 'lib', 'public-docs.mjs'))
  await writeFile(join(root, 'docs', 'index.mdx'), '# Public docs')

  const result = spawnSync(process.execPath, [join(root, 'website', 'scripts', 'check-public-docs.mjs')], PROCESS_OPTIONS)
  assert.equal(result.error, undefined)
  assert.equal(result.status, 0, result.stderr)
  assert.equal(result.stdout, 'Public documentation boundary is valid.\n')
})
