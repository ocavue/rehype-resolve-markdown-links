# rehype-resolve-markdown-links

[![NPM version](https://img.shields.io/npm/v/rehype-resolve-markdown-links?color=a1b858&label=)](https://www.npmjs.com/package/rehype-resolve-markdown-links)

A [rehype](https://github.com/rehypejs/rehype) plugin that resolves relative markdown links into absolute URL paths.

Relative `.md` / `.mdx` links are rewritten to root-absolute, extension-less URLs; `#hash` and `?query` suffixes are kept, and a link to a missing file throws. Absolute URLs, absolute paths, and non-markdown links are left untouched.

## Example

Given this file structure:

```
content/
  getting-started/
    intro.mdx
    quick-start.md
  references/
    core.md
    react/
      button.md
    web/
      button.md
```

And this configuration with `rootDir: './content'`:

| Source file                      | Markdown                         | HTML output                                       |
| -------------------------------- | -------------------------------- | ------------------------------------------------- |
| `references/react/button.md`     | `[Web Button](../web/button.md)` | `<a href="/references/web/button">Web Button</a>` |
| `references/react/button.md`     | `[Editor](../core.md#editor)`    | `<a href="/references/core#editor">Editor</a>`    |
| `getting-started/quick-start.md` | `[Intro](./intro.mdx)`           | `<a href="/getting-started/intro">Intro</a>`      |

## Install

```bash
npm install rehype-resolve-markdown-links
```

## Usage

```js
import { rehypeResolveMarkdownLinks } from 'rehype-resolve-markdown-links'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'

const file = await unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeResolveMarkdownLinks, { rootDir: './content' })
  .use(rehypeStringify)
  // The file's `path` is required — links are resolved relative to it.
  .process({ path: 'content/references/react/button.md', value: markdown })
```

## Options

### `rootDir`

**Required.** The root directory of your content files. Output links are generated relative to this directory.

## Related

Using [Sätteri](https://github.com/bruits/satteri) instead of rehype? Use [`satteri-resolve-markdown-links`](https://www.npmjs.com/package/satteri-resolve-markdown-links), which provides the same behavior for Sätteri's plugin API.

## Sponsors

<p align="center">
	<a href="https://github.com/sponsors/ocavue">
		<img src="https://cdn.jsdelivr.net/gh/ocavue/sponsors/sponsorkit/sponsors.svg" alt="My Sponsors">
	</a>
</p>

## License

MIT
