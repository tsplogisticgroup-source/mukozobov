import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// В разработке фронт живёт на 5174 и проксирует запросы в API на 3000,
// поэтому в коде везде относительные пути вида /api/...
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5175,
    strictPort: true,
    proxy: {
      '/api': 'http://127.0.0.1:3000',
      '/uploads': 'http://127.0.0.1:3000',
    },
  },
});
