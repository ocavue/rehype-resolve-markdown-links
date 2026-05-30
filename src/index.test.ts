import { resolve } from 'node:path'

import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { describe, expect, it } from 'vitest'

import { markdownToHtml } from 'satteri'

import { satteriResolveMarkdownLinks } from './satteri'

import { rehypeResolveMarkdownLinks } from './unist'

const rootDir = resolve(__dirname, '../test/fixtures/docs')

type Processor = (options: {
  markdown: string
  filePath: string | undefined
}) => string | Promise<string>

function testProcessor(process: Processor) {
  describe('basic transforms', () => {
    it('resolves a same-directory relative link', async () => {
      const markdown = '[Quick Start](./quick-start.md)'
      const filePath = resolve(rootDir, 'getting-started/quick-start.md')
      const result = await process({ markdown, filePath })
      expect(result).toBe(
        '<p><a href="/getting-started/quick-start">Quick Start</a></p>',
      )
    })

    it('resolves a parent-directory relative link', async () => {
      const markdown = '[Button](../web/button.md)'
      const filePath = resolve(rootDir, 'references/react/button.md')
      const result = await process({ markdown, filePath })
      expect(result).toBe('<p><a href="/references/web/button">Button</a></p>')
    })

    it('resolves a .mdx file', async () => {
      const markdown = '[Intro](../intro.mdx)'
      const filePath = resolve(rootDir, 'getting-started/quick-start.md')
      const result = await process({ markdown, filePath })
      expect(result).toBe('<p><a href="/intro">Intro</a></p>')
    })

    it('resolves a deeply nested link', async () => {
      const markdown = '[Core](../references/core.md)'
      const filePath = resolve(rootDir, 'getting-started/quick-start.md')
      const result = await process({ markdown, filePath })
      expect(result).toBe('<p><a href="/references/core">Core</a></p>')
    })
  })

  describe('preserves query and fragment', () => {
    it('preserves a hash fragment', async () => {
      const markdown = '[Intro](../intro.mdx#section)'
      const filePath = resolve(rootDir, 'getting-started/quick-start.md')
      const result = await process({ markdown, filePath })
      expect(result).toBe('<p><a href="/intro#section">Intro</a></p>')
    })

    it('preserves a query string', async () => {
      const markdown = '[Intro](../intro.mdx?foo=bar)'
      const filePath = resolve(rootDir, 'getting-started/quick-start.md')
      const result = await process({ markdown, filePath })
      expect(result).toBe('<p><a href="/intro?foo=bar">Intro</a></p>')
    })

    it('preserves both query string and hash fragment', async () => {
      const markdown = '[Intro](../intro.mdx?a=1#b)'
      const filePath = resolve(rootDir, 'getting-started/quick-start.md')
      const result = await process({ markdown, filePath })
      expect(result).toBe('<p><a href="/intro?a=1#b">Intro</a></p>')
    })
  })

  describe('skips non-matching links', () => {
    it('skips absolute URLs', async () => {
      const markdown = '[Link](https://example.com/page.md)'
      const filePath = resolve(rootDir, 'intro.mdx')
      const result = await process({ markdown, filePath })
      expect(result).toBe(
        '<p><a href="https://example.com/page.md">Link</a></p>',
      )
    })

    it('skips absolute file paths', async () => {
      const markdown = '[Link](/absolute/page.md)'
      const filePath = resolve(rootDir, 'intro.mdx')
      const result = await process({ markdown, filePath })
      expect(result).toBe('<p><a href="/absolute/page.md">Link</a></p>')
    })

    it('skips non-markdown links', async () => {
      const markdown = '[Link](./page.html)'
      const filePath = resolve(rootDir, 'intro.mdx')
      const result = await process({ markdown, filePath })
      expect(result).toBe('<p><a href="./page.html">Link</a></p>')
    })

    it('skips fragment-only links', async () => {
      const markdown = '[Link](#section)'
      const filePath = resolve(rootDir, 'intro.mdx')
      const result = await process({ markdown, filePath })
      expect(result).toBe('<p><a href="#section">Link</a></p>')
    })
  })

  describe('error handling', () => {
    it('throws when the target file does not exist', async () => {
      const markdown = '[Link](./nonexistent.md)'
      const filePath = resolve(rootDir, 'intro.mdx')
      await expect(
        async () => {
          await process({ markdown, filePath })
        },
      ).rejects.toThrow(/Link target not found/)
    })
  })

  describe('URL encoding', () => {
    it('decodes percent-encoded paths', async () => {
      const markdown = '[Link](./getting-started/quick-start.md)'
      const filePath = resolve(rootDir, 'intro.mdx')
      const result = await process({ markdown, filePath })
      expect(result).toBe(
        '<p><a href="/getting-started/quick-start">Link</a></p>',
      )
    })
  })

  describe('edge cases', () => {
    it('handles a file with file path', async () => {
      const markdown = '[Link](./intro.mdx)'
      const filePath = undefined
      const result = await process({ markdown, filePath })
      expect(result).toBe('<p><a href="./intro.mdx">Link</a></p>')
    })
  })
}

describe("unist", () => {
  const process: Processor = ({ markdown, filePath }) => {
    const file = unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeResolveMarkdownLinks, { rootDir })
      .use(rehypeStringify)
      .processSync({
        value: markdown,
        history: filePath ? [filePath] : undefined,
      })
    return String(file)
  }
  testProcessor(process)
})


describe("satteri", () => {
  const process: Processor =async ({ markdown, filePath }) => {
    const result = await markdownToHtml(markdown, {
      filename: filePath,
      hastPlugins: [satteriResolveMarkdownLinks({ rootDir })],
    })
    return result.html.trimEnd()
  }
  testProcessor(process)
})
