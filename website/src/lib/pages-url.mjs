export function resolvePagesUrl(publicUrl) {
  if (publicUrl === undefined) return { site: 'http://localhost', base: '/' }

  const url = new URL(publicUrl)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new TypeError('PUBLIC_SITE_URL must use http or https')
  }

  url.search = ''
  url.hash = ''
  const normalizedPath = url.pathname.replace(/^\/+|\/+$/g, '')
  const pathname = normalizedPath === '' ? '/' : `/${normalizedPath}/`
  return { site: url.origin, base: pathname }
}
