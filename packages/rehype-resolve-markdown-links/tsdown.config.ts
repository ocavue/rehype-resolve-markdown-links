import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/satteri.ts'],
  format: ['esm'],
  dts: { build: true },
  fixedExtension: false,
})
