# rehype-resolve-markdown-links

[![NPM version](https://img.shields.io/npm/v/rehype-resolve-markdown-links?color=a1b858&label=)](https://www.npmjs.com/package/rehype-resolve-markdown-links)

A [rehype](https://github.com/rehypejs/rehype) plugin that resolves relative markdown links (e.g. `./other-page.md`) into absolute URL paths (e.g. `/other-page`).

## Install

```bash
npm install rehype-resolve-markdown-links
```

## Usage

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

**Required.** The root directory of your content files.

The plugin computes each link's final URL by resolving the relative file path, then making it relative to `rootDir`, and stripping the `.md`/`.mdx` extension.

For example, given `rootDir: './src/content/docs'` and a link `../core.md#editor` in `src/content/docs/references/react/button.md`, the output would be `/references/core#editor`.

## Behavior


**Skips:**

- Absolute URLs (`https://example.com/page.md`)
- Absolute file paths (`/page.md`)
- Non-markdown links (`./page.html`, `#section`)

## License

MIT
