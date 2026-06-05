import { existsSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'

import type { Root } from 'hast'
import slash from 'slash'
import { visit } from 'unist-util-visit'
import type { VFile } from 'vfile'

import { isRelativeMdLink, splitHref } from './utils'

export interface Options {
  /**
   * Root directory of the content files. Output links are generated relative to this directory.
   */
  rootDir: string
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
