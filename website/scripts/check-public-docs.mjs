import { fileURLToPath } from 'node:url'
import { assertPublicDocsBoundary } from '../src/lib/public-docs.mjs'

const repoRoot = fileURLToPath(new URL('../..', import.meta.url))

try {
  await assertPublicDocsBoundary(repoRoot)
  console.log('Public documentation boundary is valid.')
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
}
