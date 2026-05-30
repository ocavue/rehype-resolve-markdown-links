import { existsSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'

import type { Root } from 'hast'
import slash from 'slash'
import { visit } from 'unist-util-visit'
import type { VFile } from 'vfile'

import { isRelativeMdLink, splitHref } from './utils'
import { defineHastPlugin, type HastVisitorInstance } from 'satteri'

export interface Options {
  /**
   * Root directory of the content files. Output links are generated relative to this directory.
   */
  rootDir: string
}




export function satteriResolveMarkdownLinks(
  options: Options,
): HastVisitorInstance & {name: string} {
  const rootDir = resolve(options.rootDir)

  return defineHastPlugin({
    name: "satteri-resolve-markdown-links",
    element: {
       filter: ["a"],
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

         ctx.setProperty(node, 'href', '/' + slash(withoutExt) + suffix )

       },
     },
  })

  // return (tree: Root, file: VFile) => {
  //   const currentFile = file.history[0]
  //   if (!currentFile) return

  //   const currentDir = dirname(currentFile)

  //   visit(tree, (node) => {
  //     if (node.type !== 'element') return
  //     if (node.tagName !== 'a') return

  //     const href = node.properties?.href
  //     if (typeof href !== 'string' || !href) return

  //     const [filePath, suffix] = splitHref(href)
  //     if (!isRelativeMdLink(filePath)) return

  //     const targetAbsPath = resolve(currentDir, filePath)
  //     if (!existsSync(targetAbsPath)) {
  //       throw new Error(
  //         `[rehype-resolve-markdown-links] Link target not found: ${targetAbsPath} (from ${currentFile})`,
  //       )
  //     }

  //     const relativePath = relative(rootDir, targetAbsPath)
  //     const withoutExt = relativePath.replace(/\.mdx?$/i, '')
  //     node.properties.href = '/' + slash(withoutExt) + suffix
  //   })
  // }
}
