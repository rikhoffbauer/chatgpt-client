import assert from 'node:assert/strict'
import test from 'node:test'
import { resolvePagesUrl } from '../src/lib/pages-url.mjs'

test('uses localhost defaults for local builds', () => {
  assert.deepEqual(resolvePagesUrl(), { site: 'http://localhost', base: '/' })
})

test('splits a default project Pages URL into origin and base', () => {
  assert.deepEqual(resolvePagesUrl('https://owner.github.io/chatgpt-client/'), {
    site: 'https://owner.github.io',
    base: '/chatgpt-client/',
  })
})

test('uses root base for a custom domain', () => {
  assert.deepEqual(resolvePagesUrl('https://docs.example.com/'), {
    site: 'https://docs.example.com',
    base: '/',
  })
})

test('normalizes pathname slashes and strips query and hash', () => {
  assert.deepEqual(resolvePagesUrl('https://owner.github.io/chatgpt-client?preview=1#top'), {
    site: 'https://owner.github.io',
    base: '/chatgpt-client/',
  })
})

test('rejects non-http deployment URLs', () => {
  assert.throws(() => resolvePagesUrl('file:///tmp/site'), /http/)
})
