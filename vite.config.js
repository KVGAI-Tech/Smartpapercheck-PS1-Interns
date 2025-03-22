import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Content-Security-Policy': [
        "default-src 'self' http://64.227.151.174:8000;",
        "connect-src 'self' http://64.227.151.174:8000 blob: https://*.cloudflare.com https://cdnjs.cloudflare.com https://unpkg.com https://documentcloud.adobe.com https://*.s3.amazonaws.com https://smartqna-pdf.s3.amazonaws.com https://*.s3.ap-south-1.amazonaws.com https://smartqna-pdf.s3.ap-south-1.amazonaws.com;",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdnjs.cloudflare.com;",
        "style-src 'self' 'unsafe-inline';",
        "img-src 'self' blob: data: https://*.s3.amazonaws.com https://smartqna-pdf.s3.amazonaws.com https://*.s3.ap-south-1.amazonaws.com https://smartqna-pdf.s3.ap-south-1.amazonaws.com;",
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