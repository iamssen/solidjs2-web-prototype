import autoprefixer from 'autoprefixer';
import { defineConfig } from 'vite';
import { compression } from 'vite-plugin-compression2';
import solid from 'vite-plugin-solid';

const https =
  process.env.LOCALHOST_HTTPS_CERT && process.env.LOCALHOST_HTTPS_KEY
    ? {
        cert: process.env.LOCALHOST_HTTPS_CERT,
        key: process.env.LOCALHOST_HTTPS_KEY,
      }
    : undefined;

export default defineConfig({
  root: import.meta.dirname,
  base: '/',
  server: {
    host: true,
    https,
  },
  build: {
    outDir: 'dist',
  },
  css: {
    postcss: {
      plugins: [autoprefixer({})],
    },
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    solid(),
    compression(),
    compression({
      algorithms: ['brotliCompress'],
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
  ],
});
