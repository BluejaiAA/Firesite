import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Placeholder Vite config for the future Vite migration.
// While main still ships app.html directly, this file is only used
// when we wire vercel.json to run `npm run build`.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 5173,
  },
});
