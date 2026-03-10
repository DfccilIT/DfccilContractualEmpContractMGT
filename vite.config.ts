import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
  plugins: [
    react(),
    mkcert({
      hosts: ['localhost', '127.0.0.1', '::1'],
      force: true,
    }),
  ],
  server: {
    port: 3001,
    https: {},
    host: 'localhost',
  },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});