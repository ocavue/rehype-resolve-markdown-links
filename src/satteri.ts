import { existsSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'

import { defineHastPlugin, type HastPluginDefinition } from 'satteri'
import slash from 'slash'

import { isRelativeMdLink, splitHref } from './utils'

export interface Options {
  /**
   * Root directory of the content files. Output links are generated relative to this directory.
   */
  rootDir: string
}

export function satteriResolveMarkdownLinks(
  options: Options,
): HastPluginDefinition {
  const rootDir = resolve(options.rootDir)

  const plugin: HastPluginDefinition = ({
    name: 'satteri-resolve-markdown-links',
    element: {
      filter: ['a'],
      visit(node, ctx) {
        const href = node.properties?.href
        if (typeof href !== 'string' || !href) return

        const [filePath, suffix] = splitHref(href)
        if (!isRelativeMdLink(filePath)) return

        const currentDir = dirname(ctx.filename)

        const targetAbsPath = resolve(currentDir, filePath)
        if (!existsSync(targetAbsPath)) {
          throw new Error(
            `[rehype-resolve-markdown-links] Link target not found: ${targetAbsPath} (from ${currentFile})`,
          )
        }

        const relativePath = relative(rootDir, targetAbsPath)
        const withoutExt = relativePath.replace(/\.mdx?$/i, '')

        ctx.setProperty(node, 'href', '/' + slash(withoutExt) + suffix)
      },
    },
  })

  return plugin
}
