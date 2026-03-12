import { existsSync } from 'node:fs'
import { dirname, isAbsolute, relative, resolve } from 'node:path'

import type { Root } from 'hast'
import slash from 'slash'
import { visit } from 'unist-util-visit'
import type { VFile } from 'vfile'

export interface Options {
  /**
   * Root directory of the content files. Output links are generated relative to this directory.
   */
  rootDir: string
}

function isRelativeMdLink(href: string): boolean {
  // Absolute URL (http://, https://, file://, etc.)
  if (/^[a-z][\d+.a-z-]*:/i.test(href)) return false
  // Absolute file path
  if (isAbsolute(href)) return false
  // Must have .md or .mdx extension
  return /\.mdx?$/i.test(href)
}

function splitHref(href: string): [path: string, suffix: string] {
  const idx = href.search(/[#?]/)
  if (idx === -1) return [decodeURI(href), '']
  return [decodeURI(href.slice(0, idx)), href.slice(idx)]
}

export function rehypeResolveMarkdownLinks(
  options: Options,
): (tree: Root, file: VFile) => void {
  const rootDir = resolve(options.rootDir)

  return (tree: Root, file: VFile) => {
    const currentFile = file.history[0]
    if (!currentFile) return

    const currentDir = dirname(currentFile)

    visit(tree, (node) => {
      if (node.type !== 'element') return
      if (node.tagName !== 'a') return

      const href = node.properties?.href
      if (typeof href !== 'string' || !href) return

      const [filePath, suffix] = splitHref(href)
      if (!isRelativeMdLink(filePath)) return

      const targetAbsPath = resolve(currentDir, filePath)
      if (!existsSync(targetAbsPath)) {
        throw new Error(
          `[rehype-resolve-markdown-links] Link target not found: ${targetAbsPath} (from ${currentFile})`,
        )
      }

      const relativePath = relative(rootDir, targetAbsPath)
      const withoutExt = relativePath.replace(/\.mdx?$/i, '')
      node.properties.href = '/' + slash(withoutExt) + suffix
    })
  }
}
