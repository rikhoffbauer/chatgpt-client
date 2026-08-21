import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { parseArguments } from '../src/cli.js'

test('CLI parser preserves repeated attachments and -- separator', () => {
  const parsed = parseArguments(['send', '--attach', 'a.txt', '--attach=b.txt', '--', '--literal'])
  assert.deepEqual(parsed.positional, ['send', '--literal'])
  assert.deepEqual(parsed.flags.get('attach'), ['a.txt', 'b.txt'])
})

test('compiled CLI lists routes without authentication', () => {
  const binary = fileURLToPath(new URL('../src/bin.js', import.meta.url))
  const result = spawnSync(process.execPath, [binary, 'routes', 'wham'], { encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /whamListTasks/)
})

test('compiled CLI reports its version', () => {
  const binary = fileURLToPath(new URL('../src/bin.js', import.meta.url))
  const result = spawnSync(process.execPath, [binary, '--version'], { encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr)
  assert.equal(result.stdout.trim(), '1.0.0')
})
