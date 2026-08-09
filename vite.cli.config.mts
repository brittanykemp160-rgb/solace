import { defineConfig } from 'vite';

// Builds the terminal app (src/cli) into a single Node ES module: dist-cli/solace.mjs.
// Dependencies (ink, react) stay external and load from node_modules.
export default defineConfig({
  build: {
    ssr: 'src/cli/index.tsx',
    outDir: 'dist-cli',
    emptyOutDir: true,
    target: 'node20',
    minify: false,
    rollupOptions: {
      output: { entryFileNames: 'solace.mjs', format: 'es' },
    },
  },
});
