import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    watch: {
      usePolling: true
    },
    proxy: {
      '/api': {
        target: 'http://backend:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
});
