import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// With "npm run dev" on Windows, API is published by Compose to localhost:4000.
// For Docker-only mode, prefer localhost:3000 served by Nginx.
const apiTarget = process.env.API_PROXY_TARGET || 'http://127.0.0.1:4000';
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', port: 5173, strictPort: true,
    proxy: {
      '/api': { target: apiTarget, changeOrigin: true },
      '/health': { target: apiTarget, changeOrigin: true }
    }
  }
});
