import { lstat, open, opendir, realpath, stat } from 'node:fs/promises'
import { isAbsolute, join, relative, sep } from 'node:path'

export const PUBLIC_DOC_PATTERNS = Object.freeze([
  'index.mdx',
  'getting-started/**/*.{md,mdx}',
  'guides/**/*.{md,mdx}',
  'reference/**/*.{md,mdx}',
  'project/**/*.{md,mdx}',
])

const PUBLIC_SECTIONS = new Set(['getting-started', 'guides', 'reference', 'project'])
const INTERNAL_PATHS = [
  'superpowers/specs/internal.md',
  'superpowers/plans/internal.mdx',
  'implementation-plan.md',
  'verification.md',
]
const MAX_DOC_ENTRIES = 10_000
const MAX_PUBLIC_ENTRY_BYTES = 1024 * 1024

function normalizeRelativePath(relativePath) {
  const normalized = relativePath.replaceAll('\\', '/')
  if (normalized.startsWith('/') || isAbsolute(relativePath)) return undefined

  const segments = normalized.split('/')
  if (segments.some((segment) => segment === '' || segment === '.' || segment === '..')) return undefined
  return segments
}

function isPublicLocation(relativePath) {
  const segments = normalizeRelativePath(relativePath)
  if (segments === undefined) return false
  if (segments.length === 1) return segments[0] === 'index.mdx' || PUBLIC_SECTIONS.has(segments[0])
  return PUBLIC_SECTIONS.has(segments[0])
}

export function isPublicDoc(relativePath) {
  const segments = normalizeRelativePath(relativePath)
  if (segments === undefined) return false
  if (segments.length === 1) return segments[0] === 'index.mdx'
  if (!PUBLIC_SECTIONS.has(segments[0])) return false
  return /\.mdx?$/.test(segments.at(-1))
}

function isInside(parent, candidate) {
  const pathFromParent = relative(parent, candidate)
  return pathFromParent === '' || (!pathFromParent.startsWith(`..${sep}`) && pathFromParent !== '..' && !isAbsolute(pathFromParent))
}

async function readBoundedText(path, maximumBytes) {
  const handle = await open(path, 'r')
  try {
    const chunks = []
    let totalBytes = 0
    while (totalBytes <= maximumBytes) {
      const chunk = Buffer.alloc(Math.min(64 * 1024, maximumBytes + 1 - totalBytes))
      const { bytesRead } = await handle.read(chunk, 0, chunk.length)
      if (bytesRead === 0) return Buffer.concat(chunks, totalBytes).toString('utf8')
      chunks.push(chunk.subarray(0, bytesRead))
      totalBytes += bytesRead
    }
    throw new Error(`Public entry content exceeds the ${maximumBytes} byte limit`)
  } finally {
    await handle.close()
  }
}

export async function assertPublicDocsBoundary(repoRoot) {
  for (const internalPath of INTERNAL_PATHS) {
    if (isPublicDoc(internalPath)) {
      throw new Error(`Public documentation allowlist admits internal path: ${internalPath}`)
    }
  }

  const docsPath = join(repoRoot, 'docs')
  const docsMetadata = await lstat(docsPath)
  if (docsMetadata.isSymbolicLink()) throw new Error('The docs root must not be a symlink')

  const docsRealPath = await realpath(docsPath)
  const directories = [{ path: docsPath, relativePath: '' }]
  const visitedDirectories = new Set([docsRealPath])
  let entryCount = 0

  while (directories.length > 0) {
    const directory = directories.pop()
    const entries = await opendir(directory.path)
    for await (const entry of entries) {
      entryCount += 1
      if (entryCount > MAX_DOC_ENTRIES) {
        throw new Error(`Documentation tree exceeds the ${MAX_DOC_ENTRIES} entry limit`)
      }

      const path = join(directory.path, entry.name)
      const relativePath = directory.relativePath === '' ? entry.name : `${directory.relativePath}/${entry.name}`
      const metadata = await lstat(path)
      let resolvedPath = path
      let resolvedMetadata = metadata

      if (metadata.isSymbolicLink()) {
        resolvedPath = await realpath(path)
        if (!isInside(docsRealPath, resolvedPath)) {
          throw new Error(`Documentation symlink escapes docs: ${relativePath}`)
        }
        const targetPath = relative(docsRealPath, resolvedPath).split(sep).join('/')
        if (isPublicLocation(relativePath) && !isPublicLocation(targetPath)) {
          throw new Error(`Public symlink aliases internal documentation: ${relativePath}`)
        }
        resolvedMetadata = await stat(path)
      }

      if (resolvedMetadata.isDirectory()) {
        const resolvedDirectory = await realpath(resolvedPath)
        if (!visitedDirectories.has(resolvedDirectory)) {
          visitedDirectories.add(resolvedDirectory)
          directories.push({ path, relativePath })
        }
        continue
      }

      if (isPublicDoc(relativePath)) {
        const resolvedFile = await realpath(path)
        if (!isInside(docsRealPath, resolvedFile)) {
          throw new Error(`Public document escapes docs: ${relativePath}`)
        }
        const targetPath = relative(docsRealPath, resolvedFile).split(sep).join('/')
        if (!isPublicDoc(targetPath)) {
          throw new Error(`Public symlink aliases internal documentation: ${relativePath}`)
        }
      }
    }
  }

  const entryPath = join(docsPath, 'index.mdx')
  const entryContents = await readBoundedText(entryPath, MAX_PUBLIC_ENTRY_BYTES).catch((error) => {
    if (error.code === 'ENOENT') throw new Error('Missing public entry content: docs/index.mdx')
    throw error
  })
  if (entryContents.trim() === '') throw new Error('Missing public entry content: docs/index.mdx is empty')
}
