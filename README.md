# resolve-markdown-links

Resolve relative markdown links (`./other.md`) into absolute URL paths (`/other`).

When you author docs as markdown files that link to each other on disk, those
links break once the files are rendered to a website. These plugins rewrite each
relative `.md` / `.mdx` link to the clean, root-absolute URL the page will live
at — preserving `#hash` and `?query` suffixes, and throwing if a link points at a
file that doesn't exist.

The same logic ships for two markdown toolchains. Pick the package that matches
your engine; both share a single `rootDir` option and produce identical output.

## Packages

| Package                                                                       | For                                                                                                      | npm                                                                                                                                                             |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`rehype-resolve-markdown-links`](./packages/rehype-resolve-markdown-links)   | [rehype](https://github.com/rehypejs/rehype) / [unified](https://github.com/unifiedjs/unified) pipelines | [![NPM version](https://img.shields.io/npm/v/rehype-resolve-markdown-links?color=a1b858&label=)](https://www.npmjs.com/package/rehype-resolve-markdown-links)   |
| [`satteri-resolve-markdown-links`](./packages/satteri-resolve-markdown-links) | [Sätteri](https://github.com/bruits/satteri)                                                             | [![NPM version](https://img.shields.io/npm/v/satteri-resolve-markdown-links?color=a1b858&label=)](https://www.npmjs.com/package/satteri-resolve-markdown-links) |

## Sponsors

<p align="center">
	<a href="https://github.com/sponsors/ocavue">
		<img src="https://cdn.jsdelivr.net/gh/ocavue/sponsors/sponsorkit/sponsors.svg" alt="My Sponsors">
	</a>
</p>

## License

MIT
