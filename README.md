# rehype-resolve-markdown-links

[![NPM version](https://img.shields.io/npm/v/rehype-resolve-markdown-links?color=a1b858&label=)](https://www.npmjs.com/package/rehype-resolve-markdown-links)

A [rehype](https://github.com/rehypejs/rehype) plugin that resolves relative markdown links into absolute URL paths.

## Example

Given this file structure:

```
content/
  getting-started/
    intro.md
    quick-start.md
  references/
    core.md
    react/
      button.md
    web/
      button.md
```

And this configuration with `rootDir: './content'`:

| Source file                      | Link in source      | Output                    |
| -------------------------------- | ------------------- | ------------------------- |
| `references/react/button.md`     | `../web/button.md`  | `/references/web/button`  |
| `references/react/button.md`     | `../core.md#editor` | `/references/core#editor` |
| `getting-started/quick-start.md` | `./intro.md`        | `/getting-started/intro`  |

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

**Required.** The root directory of your content files. Output links are generated relative to this directory.

## License

MIT
