import { resolve } from 'node:path'

import { markdownToHtml } from 'satteri'
import { describe, expect, it } from 'vitest'

import { satteriResolveMarkdownLinks } from './satteri'

const rootDir = resolve(__dirname, '../test/fixtures/docs')

async function process(
  markdown: string,
  filePath: string | undefined,
): Promise<string> {
  const result = await markdownToHtml(markdown, {
    filename: filePath,
    hastPlugins: [satteriResolveMarkdownLinks({ rootDir })],
  })
  return result.html.trimEnd()
}

function fileIn(relativePath: string) {
  return resolve(rootDir, relativePath)
}

describe('rehypeResolveMarkdownLinks', () => {
  describe('basic transforms', () => {
    it('resolves a same-directory relative link', async () => {
      const result = await process(
        '[Quick Start](./quick-start.md)',
        fileIn('getting-started/quick-start.md'),
      )
      expect(result).toBe(
        '<p><a href="/getting-started/quick-start">Quick Start</a></p>',
      )
    })

    it('resolves a parent-directory relative link', async () => {
      const result = await process(
        '[Button](../web/button.md)',
        fileIn('references/react/button.md'),
      )
      expect(result).toBe('<p><a href="/references/web/button">Button</a></p>')
    })

    it('resolves a .mdx file', async () => {
      const result = await process(
        '[Intro](../intro.mdx)',
        fileIn('getting-started/quick-start.md'),
      )
      expect(result).toBe('<p><a href="/intro">Intro</a></p>')
    })

    it('resolves a deeply nested link', async () => {
      const result = await process(
        '[Core](../references/core.md)',
        fileIn('getting-started/quick-start.md'),
      )
      expect(result).toBe('<p><a href="/references/core">Core</a></p>')
    })
  })

  describe('preserves query and fragment', () => {
    it('preserves a hash fragment', async () => {
      const result = await process(
        '[Intro](../intro.mdx#section)',
        fileIn('getting-started/quick-start.md'),
      )
      expect(result).toBe('<p><a href="/intro#section">Intro</a></p>')
    })

    it('preserves a query string', async () => {
      const result = await process(
        '[Intro](../intro.mdx?foo=bar)',
        fileIn('getting-started/quick-start.md'),
      )
      expect(result).toBe('<p><a href="/intro?foo=bar">Intro</a></p>')
    })

    it('preserves both query string and hash fragment', async () => {
      const result = await process(
        '[Intro](../intro.mdx?a=1#b)',
        fileIn('getting-started/quick-start.md'),
      )
      expect(result).toBe('<p><a href="/intro?a=1#b">Intro</a></p>')
    })
  })

  describe('skips non-matching links', () => {
    it('skips absolute URLs', async () => {
      const result = await process(
        '[Link](https://example.com/page.md)',
        fileIn('intro.mdx'),
      )
      expect(result).toBe(
        '<p><a href="https://example.com/page.md">Link</a></p>',
      )
    })

    it('skips absolute file paths', async () => {
      const result = await process(
        '[Link](/absolute/page.md)',
        fileIn('intro.mdx'),
      )
      expect(result).toBe('<p><a href="/absolute/page.md">Link</a></p>')
    })

    it('skips non-markdown links', async () => {
      const result = await process('[Link](./page.html)', fileIn('intro.mdx'))
      expect(result).toBe('<p><a href="./page.html">Link</a></p>')
    })

    it('skips fragment-only links', async () => {
      const result = await process('[Link](#section)', fileIn('intro.mdx'))
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
    it('decodes percent-encoded paths', async () => {
      const result = await process(
        '[Link](./getting-started/quick-start.md)',
        fileIn('intro.mdx'),
      )
      expect(result).toBe(
        '<p><a href="/getting-started/quick-start">Link</a></p>',
      )
    })
  })

  describe('edge cases', () => {
    it('handles a file with no history', async () => {
      const result = await process('[Link](./intro.mdx)', undefined)
      expect(result).toBe('<p><a href="./intro.mdx">Link</a></p>')
    })
  })
})
