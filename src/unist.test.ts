import { resolve } from 'node:path'

import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { describe, expect, it } from 'vitest'

import { rehypeResolveMarkdownLinks } from './unist'

const rootDir = resolve(__dirname, '../test/fixtures/docs')

type Process = (markdown: string, filePath: string | undefined) => string

const process: Process = (markdown, filePath) => {
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

type Process_V2 = (options: { markdown: string, filePath: string | undefined }) => string

const process_v2: Process_V2 = ({ markdown, filePath }) => {
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


function fileIn(relativePath: string) {
  return resolve(rootDir, relativePath)
}

describe('rehypeResolveMarkdownLinks', () => {
  describe('basic transforms', () => {
    it('resolves a same-directory relative link', () => {
      const markdown = '[Quick Start](./quick-start.md)';
      const filePath = resolve(rootDir, 'getting-started/quick-start.md')
      const result = process_v2({markdown, filePath})
      expect(result).toBe(
        '<p><a href="/getting-started/quick-start">Quick Start</a></p>',
      )
    })

    it('resolves a parent-directory relative link', () => {
      const result = process(
        '[Button](../web/button.md)',
        fileIn('references/react/button.md'),
      )
      expect(result).toBe('<p><a href="/references/web/button">Button</a></p>')
    })

    it('resolves a .mdx file', () => {
      const result = process(
        '[Intro](../intro.mdx)',
        fileIn('getting-started/quick-start.md'),
      )
      expect(result).toBe('<p><a href="/intro">Intro</a></p>')
    })

    it('resolves a deeply nested link', () => {
      const result = process(
        '[Core](../references/core.md)',
        fileIn('getting-started/quick-start.md'),
      )
      expect(result).toBe('<p><a href="/references/core">Core</a></p>')
    })
  })

  describe('preserves query and fragment', () => {
    it('preserves a hash fragment', () => {
      const result = process(
        '[Intro](../intro.mdx#section)',
        fileIn('getting-started/quick-start.md'),
      )
      expect(result).toBe('<p><a href="/intro#section">Intro</a></p>')
    })

    it('preserves a query string', () => {
      const result = process(
        '[Intro](../intro.mdx?foo=bar)',
        fileIn('getting-started/quick-start.md'),
      )
      expect(result).toBe('<p><a href="/intro?foo=bar">Intro</a></p>')
    })

    it('preserves both query string and hash fragment', () => {
      const result = process(
        '[Intro](../intro.mdx?a=1#b)',
        fileIn('getting-started/quick-start.md'),
      )
      expect(result).toBe('<p><a href="/intro?a=1#b">Intro</a></p>')
    })
  })

  describe('skips non-matching links', () => {
    it('skips absolute URLs', () => {
      const result = process(
        '[Link](https://example.com/page.md)',
        fileIn('intro.mdx'),
      )
      expect(result).toBe(
        '<p><a href="https://example.com/page.md">Link</a></p>',
      )
    })

    it('skips absolute file paths', () => {
      const result = process('[Link](/absolute/page.md)', fileIn('intro.mdx'))
      expect(result).toBe('<p><a href="/absolute/page.md">Link</a></p>')
    })

    it('skips non-markdown links', () => {
      const result = process('[Link](./page.html)', fileIn('intro.mdx'))
      expect(result).toBe('<p><a href="./page.html">Link</a></p>')
    })

    it('skips fragment-only links', () => {
      const result = process('[Link](#section)', fileIn('intro.mdx'))
      expect(result).toBe('<p><a href="#section">Link</a></p>')
    })
  })

  describe('error handling', () => {
    it('throws when the target file does not exist', () => {
      expect(() =>
        process('[Link](./nonexistent.md)', fileIn('intro.mdx')),
      ).toThrow(/Link target not found/)
    })
  })

  describe('URL encoding', () => {
    it('decodes percent-encoded paths', () => {
      const result = process(
        '[Link](./getting-started/quick-start.md)',
        fileIn('intro.mdx'),
      )
      expect(result).toBe(
        '<p><a href="/getting-started/quick-start">Link</a></p>',
      )
    })
  })

  describe('edge cases', () => {
    it('handles a file with no history', () => {
      const result = process('[Link](./intro.mdx)', undefined)
      expect(result).toBe('<p><a href="./intro.mdx">Link</a></p>')
    })
  })
})
