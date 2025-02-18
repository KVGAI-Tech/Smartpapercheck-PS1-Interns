import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Content-Security-Policy': [
        "default-src 'self' http://43.205.184.7:8000;",
        "connect-src 'self' http://43.205.184.7:8000 blob: https://*.cloudflare.com https://cdnjs.cloudflare.com https://unpkg.com https://documentcloud.adobe.com;",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdnjs.cloudflare.com;",
        "style-src 'self' 'unsafe-inline';",
        "img-src 'self' blob: data:;",
        "font-src 'self' data:;",
        "worker-src 'self' blob:;",
        "frame-src 'self' blob:;"
      ].join('; ')
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
});