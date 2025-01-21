import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/networkmap/',
  server: {
    port: 3000,
    proxy: {
      '^/networkmap/api/.*': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/networkmap/, '')
      },
      '^/api/.*': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    },
    hmr: {
      clientPort: 3000
    }
  },
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});
