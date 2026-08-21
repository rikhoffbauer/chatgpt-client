import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import starlightCopyButton from 'starlight-copy-button'
import starlightDotMd from 'starlight-dot-md'
import starlightLinksValidator from 'starlight-links-validator'
import starlightLlmsTxt from 'starlight-llms-txt'
import starlightTypeDoc, { typeDocSidebarGroup } from 'starlight-typedoc'
import packageJson from '../package.json' with { type: 'json' }
import { resolvePagesUrl } from './src/lib/pages-url.mjs'

const { site, base } = resolvePagesUrl(process.env.PUBLIC_SITE_URL)
const repository = process.env.GITHUB_REPOSITORY
const editLink = repository === undefined
  ? {}
  : { editLink: { baseUrl: `https://github.com/${repository}/edit/main/docs/` } }

export default defineConfig({
  site,
  base,
  output: 'static',
  integrations: [
    starlight({
      title: 'ChatGPT Client',
      description: packageJson.description,
      ...editLink,
      sidebar: [
        { label: 'Home', link: '/' },
        {
          label: 'Getting started',
          items: [
            { label: 'Installation and requirements', link: '/getting-started/installation/' },
            { label: 'Library quick start', link: '/getting-started/library-quick-start/' },
            { label: 'CLI quick start', link: '/getting-started/cli-quick-start/' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Authentication and configuration', link: '/guides/authentication-configuration/' },
            { label: 'Conversations and streaming', link: '/guides/conversations-streaming/' },
            { label: 'File upload and download', link: '/guides/files/' },
            { label: 'Local Codex app-server', link: '/guides/app-server/' },
            { label: 'Cancellation, deadlines, and resource limits', link: '/guides/cancellation-limits/' },
          ],
        },
        {
          label: 'Reference',
          items: [
            typeDocSidebarGroup,
            { label: 'CLI command reference', link: '/reference/cli/' },
            { label: 'Environment variables and defaults', link: '/reference/environment/' },
          ],
        },
        {
          label: 'Project',
          items: [
            { label: 'Architecture', link: '/project/architecture/' },
            { label: 'Security and operational boundaries', link: '/project/security/' },
            { label: 'Development and verification', link: '/project/development/' },
          ],
        },
      ],
      plugins: [
        starlightTypeDoc({
          entryPoints: ['../src/index.ts'],
          tsconfig: '../tsconfig.json',
          sidebar: { label: 'TypeScript API reference' },
        }),
        starlightLlmsTxt(),
        starlightDotMd(),
        starlightCopyButton(),
        starlightLinksValidator(),
      ],
    }),
  ],
})
