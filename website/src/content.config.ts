import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { docsSchema } from '@astrojs/starlight/schema'
import { PUBLIC_DOC_PATTERNS } from './lib/public-docs.mjs'

const authoredDocs = {
  pattern: [...PUBLIC_DOC_PATTERNS],
  base: '../docs',
}

const generatedApiPattern = 'website/src/content/docs/api/**/*.{md,mdx}'
const docsPrefix = 'docs/'
const generatedPrefix = 'website/src/content/docs/'

function documentationId({ entry }: { entry: string }): string {
  const relativePath = entry.startsWith(docsPrefix)
    ? entry.slice(docsPrefix.length)
    : entry.startsWith(generatedPrefix)
      ? entry.slice(generatedPrefix.length)
      : entry

  return relativePath
    .replace(/(?:^|\/)README\.mdx?$/i, '')
    .replace(/\.mdx?$/i, '')
    .replace(/\/$/, '')
    .toLowerCase()
}

export const collections = {
  docs: defineCollection({
    loader: glob({
      pattern: [
        ...authoredDocs.pattern.map((pattern) => `docs/${pattern}`),
        generatedApiPattern,
      ],
      base: '..',
      generateId: documentationId,
    }),
    schema: docsSchema(),
  }),
}
