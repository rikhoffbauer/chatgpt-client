import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { docsSchema } from '@astrojs/starlight/schema'
import { PUBLIC_DOC_PATTERNS } from './lib/public-docs.mjs'

export const collections = {
  docs: defineCollection({
    loader: glob({
      pattern: [...PUBLIC_DOC_PATTERNS],
      base: '../docs',
    }),
    schema: docsSchema(),
  }),
}
