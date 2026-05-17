import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      protocolImports: true,
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      include: ['buffer', 'process', 'global'],
    }),
  ],
  define: {
    'global': 'globalThis',
    'process.env': {},
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
    include: ['simple-peer', 'buffer', 'process'],
  },
  build: {
    outDir: 'dist',
    // Remove the inline limit - this causes huge files
    assetsInlineLimit: 4096, // Only inline files under 4kb
    cssCodeSplit: true, // Split CSS for better loading
    rollupOptions: {
      output: {
        // Split code into manageable chunks
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', 'react-icons', 'framer-motion'],
          'socket-vendor': ['socket.io-client', 'simple-peer'],
          'chart-vendor': ['recharts'],
          'email-vendor': ['@emailjs/browser'],
          'payment-vendor': ['react-paystack'],
        },
        // Optimize chunk size
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
    // Reduce source maps in production
    sourcemap: false,
    // Target modern browsers
    target: 'es2020',
    // Minify aggressively
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  server: {
    port: 3000,
  },
})