import { constants } from 'node:fs'
import { lstat, open, opendir, realpath, stat } from 'node:fs/promises'
import { isAbsolute, join, normalize, relative, sep } from 'node:path'

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
const MARKDOWN_LINK = /\[[^\]]*\]\(([^)]+)\)/g
const FRONTMATTER_LINK = /^\s*link:\s*([^#\s]+)\s*$/gm
const GENERATED_ROUTES = new Set(['/api/'])

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
  const handle = await open(path, constants.O_RDONLY | constants.O_NONBLOCK)
  try {
    const metadata = await handle.stat()
    if (!metadata.isFile()) throw new Error(`Documentation entries must be regular files or directories: ${path}`)
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

function routeForPublicDoc(relativePath) {
  if (relativePath === 'index.mdx') return '/'
  return `/${relativePath.replace(/\.mdx?$/, '').replace(/\/index$/, '')}/`
}

function normalizeRoute(value, sourceRoute) {
  const raw = value.trim().replace(/^<|>$/g, '').split(/[?#]/, 1)[0]
  if (raw === '' || /^(?:[a-z][a-z0-9+.-]*:|#)/i.test(value.trim())) return undefined
  const route = raw.startsWith('/')
    ? raw
    : join(sourceRoute, '..', raw)
  const normalized = `/${normalize(route).replaceAll('\\', '/').replace(/^\/+/, '')}`
  return normalized.endsWith('/') ? normalized : `${normalized}/`
}

/** Validates links between allowlisted authored pages and generated API entry points. */
export function assertPublicDocLinks(entries) {
  const routes = new Set([...GENERATED_ROUTES, ...entries.map(({ relativePath }) => routeForPublicDoc(relativePath))])
  for (const { relativePath, contents } of entries) {
    const sourceRoute = routeForPublicDoc(relativePath)
    const links = [
      ...Array.from(contents.matchAll(MARKDOWN_LINK), (match) => match[1]),
      ...Array.from(contents.matchAll(FRONTMATTER_LINK), (match) => match[1]),
    ]
    for (const link of links) {
      const route = normalizeRoute(link, sourceRoute)
      if (route === undefined) continue
      const accepted = routes.has(route) || (route.startsWith('/api/') && routes.has('/api/'))
      if (!accepted) throw new Error(`Broken public documentation link in ${relativePath}: ${link}`)
    }
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
  if (!docsMetadata.isDirectory()) throw new Error('The docs root must be a regular directory')

  const docsRealPath = await realpath(docsPath)
  const directories = [{ path: docsPath, relativePath: '' }]
  const publicEntries = []
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

      if (!resolvedMetadata.isDirectory() && !resolvedMetadata.isFile()) {
        throw new Error(`Documentation entries must be regular files or directories: ${relativePath}`)
      }

      if (resolvedMetadata.isDirectory()) {
        // Validate directory symlinks above, but enumerate every physical directory
        // exactly once so aliases cannot mask nested entries through visit order.
        if (!metadata.isSymbolicLink()) directories.push({ path, relativePath })
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
        publicEntries.push({
          relativePath,
          contents: await readBoundedText(path, MAX_PUBLIC_ENTRY_BYTES),
        })
      }
    }
  }

  const entryPath = join(docsPath, 'index.mdx')
  const entryContents = await readBoundedText(entryPath, MAX_PUBLIC_ENTRY_BYTES).catch((error) => {
    if (error.code === 'ENOENT') throw new Error('Missing public entry content: docs/index.mdx')
    throw error
  })
  if (entryContents.trim() === '') throw new Error('Missing public entry content: docs/index.mdx is empty')
  assertPublicDocLinks(publicEntries)
}
