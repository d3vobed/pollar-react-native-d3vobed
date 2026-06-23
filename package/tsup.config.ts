import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-native', '@pollar/core'],
  esbuildOptions(options) {
    options.platform = 'neutral'
  },
})
