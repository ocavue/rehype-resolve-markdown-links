import { isAbsolute } from 'node:path/posix'

export function isRelativeMdLink(href: string): boolean {
  // Absolute URL (http://, https://, file://, etc.)
  if (/^[a-z][\d+.a-z-]*:/i.test(href)) return false
  // Absolute file path
  if (isAbsolute(href)) return false
  // Must have .md or .mdx extension
  return /\.mdx?$/i.test(href)
}

export function splitHref(href: string): [path: string, suffix: string] {
  const idx = href.search(/[#?]/)
  if (idx === -1) return [decodeURI(href), '']
  return [decodeURI(href.slice(0, idx)), href.slice(idx)]
}
