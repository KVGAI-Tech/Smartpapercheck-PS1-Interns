import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', 
    port: 5173,
    allowedHosts: ['dev.smart-qna.com', 'localhost','smartpapercheck.com'],
    proxy: {
      '/api': {
        target: 'https://smartpapercheck.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    },
    cors: {
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      optionsSuccessStatus: 204,
      credentials: true
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'Cross-Origin-Opener-Policy': 'unsafe-none',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    },
    hmr:
      process.env.VITE_HMR_HOST || process.env.VITE_HMR_PROTOCOL || process.env.VITE_HMR_CLIENT_PORT
        ? {
            protocol: process.env.VITE_HMR_PROTOCOL || 'ws',
            host: process.env.VITE_HMR_HOST,
            clientPort: process.env.VITE_HMR_CLIENT_PORT
              ? Number(process.env.VITE_HMR_CLIENT_PORT)
              : undefined,
          }
        : undefined,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
});