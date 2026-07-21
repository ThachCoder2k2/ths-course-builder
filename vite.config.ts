import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// This config runs in Node, but @types/node is not a dependency — declare the
// single global we need rather than pulling one in.
declare const process: { env: Record<string, string | undefined> };

export default defineConfig({
  plugins: [react()],
  server: {
    // Honour a harness-assigned port; fall back to Vite's default.
    port: Number(process.env.PORT) || 5173,
  },
});
