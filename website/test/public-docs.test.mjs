import assert from 'node:assert/strict'
import { mkdtemp, mkdir, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { PUBLIC_DOC_PATTERNS, assertPublicDocsBoundary, isPublicDoc } from '../src/lib/public-docs.mjs'

test('publishes only explicitly approved documentation sections', () => {
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

test('rejects a missing public entry page', async () => {
  const root = await mkdtemp(join(tmpdir(), 'chatgpt-docs-'))
  await mkdir(join(root, 'docs'), { recursive: true })
  await assert.rejects(assertPublicDocsBoundary(root), /index\.mdx/)
})

test('rejects a public document symlink that escapes docs', async () => {
  const root = await mkdtemp(join(tmpdir(), 'chatgpt-docs-'))
  await mkdir(join(root, 'docs', 'guides'), { recursive: true })
  await writeFile(join(root, 'outside.md'), '# secret')
  await symlink(join(root, 'outside.md'), join(root, 'docs', 'guides', 'escape.md'))
  await assert.rejects(assertPublicDocsBoundary(root), /escapes docs/)
})
