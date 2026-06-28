import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Конфигурация сборщика Vite.
// Плагин react нужен для будущих компонентов с JSX (Фаза 2).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true, // автоматически открывать браузер при `npm run dev`
  },
});
