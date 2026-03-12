import { resolve } from 'node:path'

import rehypeParse from 'rehype-parse'
import rehypeStringify from 'rehype-stringify'
import { unified } from 'unified'
import { describe, expect, it } from 'vitest'

import { rehypeResolveMarkdownLinks } from './index'

const rootDir = resolve(__dirname, '../test/fixtures/docs')

function process(html: string, currentFile: string) {
  const file = unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeResolveMarkdownLinks, { rootDir })
    .use(rehypeStringify)
    .processSync({ value: html, history: [currentFile] })
  return String(file)
}

function fileIn(relativePath: string) {
  return resolve(rootDir, relativePath)
}

describe('rehypeResolveMarkdownLinks', () => {
  describe('basic transforms', () => {
    it('resolves a same-directory relative link', () => {
      const result = process(
        '<a href="./quick-start.md">Quick Start</a>',
        fileIn('getting-started/quick-start.md'),
      )
      expect(result).toBe(
        '<a href="/getting-started/quick-start">Quick Start</a>',
      )
    })

    it('resolves a parent-directory relative link', () => {
      const result = process(
        '<a href="../web/button.md">Button</a>',
        fileIn('references/react/button.md'),
      )
      expect(result).toBe('<a href="/references/web/button">Button</a>')
    })

    it('resolves a .mdx file', () => {
      const result = process(
        '<a href="../intro.mdx">Intro</a>',
        fileIn('getting-started/quick-start.md'),
      )
      expect(result).toBe('<a href="/intro">Intro</a>')
    })

    it('resolves a deeply nested link', () => {
      const result = process(
        '<a href="../references/core.md">Core</a>',
        fileIn('getting-started/quick-start.md'),
      )
      expect(result).toBe('<a href="/references/core">Core</a>')
    })
  })

  describe('preserves query and fragment', () => {
    it('preserves a hash fragment', () => {
      const result = process(
        '<a href="../intro.md#section">Intro</a>',
        fileIn('getting-started/quick-start.md'),
      )
      expect(result).toBe('<a href="/intro#section">Intro</a>')
    })

    it('preserves a query string', () => {
      const result = process(
        '<a href="../intro.md?foo=bar">Intro</a>',
        fileIn('getting-started/quick-start.md'),
      )
      expect(result).toBe('<a href="/intro?foo=bar">Intro</a>')
    })

    it('preserves both query string and hash fragment', () => {
      const result = process(
        '<a href="../intro.md?a=1#b">Intro</a>',
        fileIn('getting-started/quick-start.md'),
      )
      expect(result).toBe('<a href="/intro?a=1#b">Intro</a>')
    })
  })

  describe('skips non-matching links', () => {
    it('skips absolute URLs', () => {
      const result = process(
        '<a href="https://example.com/page.md">Link</a>',
        fileIn('intro.md'),
      )
      expect(result).toBe('<a href="https://example.com/page.md">Link</a>')
    })

    it('skips absolute file paths', () => {
      const result = process(
        '<a href="/absolute/page.md">Link</a>',
        fileIn('intro.md'),
      )
      expect(result).toBe('<a href="/absolute/page.md">Link</a>')
    })

    it('skips non-markdown links', () => {
      const result = process(
        '<a href="./page.html">Link</a>',
        fileIn('intro.md'),
      )
      expect(result).toBe('<a href="./page.html">Link</a>')
    })

    it('skips fragment-only links', () => {
      const result = process('<a href="#section">Link</a>', fileIn('intro.md'))
      expect(result).toBe('<a href="#section">Link</a>')
    })

    it('skips links without href', () => {
      const result = process('<a>Link</a>', fileIn('intro.md'))
      expect(result).toBe('<a>Link</a>')
    })
  })

  describe('error handling', () => {
    it('throws when the target file does not exist', () => {
      expect(() =>
        process('<a href="./nonexistent.md">Link</a>', fileIn('intro.md')),
      ).toThrow(/Link target not found/)
    })
  })

  describe('URL encoding', () => {
    it('decodes percent-encoded paths', () => {
      const result = process(
        '<a href="./getting-started/quick-start.md">Link</a>',
        fileIn('intro.md'),
      )
      expect(result).toBe('<a href="/getting-started/quick-start">Link</a>')
    })
  })

  describe('HTML source links', () => {
    it('resolves links inside nested HTML elements', () => {
      const result = process(
        '<div><p><a href="../web/button.md#props">Button</a></p></div>',
        fileIn('references/react/button.md'),
      )
      expect(result).toBe(
        '<div><p><a href="/references/web/button#props">Button</a></p></div>',
      )
    })
  })

  describe('edge cases', () => {
    it('handles a file with no history', () => {
      const file = unified()
        .use(rehypeParse, { fragment: true })
        .use(rehypeResolveMarkdownLinks, { rootDir })
        .use(rehypeStringify)
        .processSync({ value: '<a href="./intro.md">Link</a>', history: [] })
      expect(String(file)).toBe('<a href="./intro.md">Link</a>')
    })
  })
})
