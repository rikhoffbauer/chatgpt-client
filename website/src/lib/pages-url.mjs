export function resolvePagesUrl(publicUrl) {
  if (publicUrl === undefined) return { site: 'http://localhost', base: '/' }

  const url = new URL(publicUrl)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new TypeError('PUBLIC_SITE_URL must use http or https')
  }

  url.search = ''
  url.hash = ''
  const pathname = url.pathname === '/' ? '/' : `/${url.pathname.replace(/^\/+|\/+$/g, '')}/`
  return { site: url.origin, base: pathname }
}
