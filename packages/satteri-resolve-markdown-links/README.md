# satteri-resolve-markdown-links

[![NPM version](https://img.shields.io/npm/v/satteri-resolve-markdown-links?color=a1b858&label=)](https://www.npmjs.com/package/satteri-resolve-markdown-links)

A [Sätteri](https://github.com/bruits/satteri) plugin that resolves relative markdown links into absolute URL paths.

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
npm install satteri-resolve-markdown-links satteri
```

## Usage

```js
import { pathToFileURL } from 'node:url'

import { markdownToHtml } from 'satteri'
import { satteriResolveMarkdownLinks } from 'satteri-resolve-markdown-links'

const { html } = await markdownToHtml(markdown, {
  // The file URL is required — links are resolved relative to it.
  fileURL: pathToFileURL('content/references/react/button.md'),
  hastPlugins: [satteriResolveMarkdownLinks({ rootDir: './content' })],
})
```

## Options

### `rootDir`

**Required.** The root directory of your content files. Output links are generated relative to this directory.

## Related

Using [rehype](https://github.com/rehypejs/rehype) / [unified](https://github.com/unifiedjs/unified) instead of Sätteri? Use [`rehype-resolve-markdown-links`](https://www.npmjs.com/package/rehype-resolve-markdown-links), which provides the same behavior as a rehype plugin.

## Sponsors

<p align="center">
	<a href="https://github.com/sponsors/ocavue">
		<img src="https://cdn.jsdelivr.net/gh/ocavue/sponsors/sponsorkit/sponsors.svg" alt="My Sponsors">
	</a>
</p>

## License

MIT
