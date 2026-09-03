import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    /**
     * ⚠️ THE GEMINI KEY IS DELIBERATELY NOT DEFINED HERE.
     *
     * This config used to inject process.env.GEMINI_API_KEY into the client
     * bundle. Nothing in src/ reads it — every AI call goes through the
     * server's /api/gemini/* routes — but the define meant that the moment a
     * real .env existed (which the server needs), `vite build` would bake the
     * secret as a plain string into public JavaScript for anyone to read.
     *
     * The key belongs to the server process only. If a client value is ever
     * genuinely needed, use a VITE_-prefixed variable and understand that
     * anything so exposed is public by definition.
     */
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
