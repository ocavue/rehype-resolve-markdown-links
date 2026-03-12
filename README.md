# rehype-resolve-markdown-links

[![NPM version](https://img.shields.io/npm/v/rehype-resolve-markdown-links?color=a1b858&label=)](https://www.npmjs.com/package/rehype-resolve-markdown-links)

A [rehype](https://github.com/rehypejs/rehype) plugin that resolves relative markdown links (e.g. `./other-page.md`) into absolute URL paths (e.g. `/other-page`).

## Install

```bash
npm install rehype-resolve-markdown-links
```

## Usage

### With Astro

```js
// astro.config.mjs
import { rehypeResolveMarkdownLinks } from 'rehype-resolve-markdown-links'

export default {
  markdown: {
    rehypePlugins: [
      [rehypeResolveMarkdownLinks, { rootDir: './src/content/docs' }],
    ],
  },
}
```

### With unified

```js
import rehypeParse from 'rehype-parse'
import { rehypeResolveMarkdownLinks } from 'rehype-resolve-markdown-links'
import rehypeStringify from 'rehype-stringify'
import { unified } from 'unified'

const file = await unified()
  .use(rehypeParse)
  .use(rehypeResolveMarkdownLinks, { rootDir: './content' })
  .use(rehypeStringify)
  .process(html)
```

## Options

### `rootDir`

**Required.** The root directory of your content files. Relative paths are resolved against the current working directory.

The plugin computes each link's final URL by resolving the relative file path, then making it relative to `rootDir`, and stripping the `.md`/`.mdx` extension.

For example, given `rootDir: './src/content/docs'` and a link `../core.md#editor` in `src/content/docs/references/react/button.md`, the output would be `/references/core#editor`.

## Behavior

**Transforms:**

- Relative `.md` and `.mdx` links (e.g. `./page.md`, `../other/page.mdx`)

**Preserves:**

- Query strings and hash fragments (e.g. `./page.md?a=1#section` → `/page?a=1#section`)

**Skips:**

- Absolute URLs (`https://example.com/page.md`)
- Absolute file paths (`/page.md`)
- Non-markdown links (`./page.html`, `#section`)

**Errors:**

- Throws if a relative markdown link points to a file that does not exist

## License

MIT
