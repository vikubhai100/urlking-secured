import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),

    // 🚀 Gzip Compression (Fast)
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024, // 1KB se badi files ko compress karega
    }),

    // 🔥 Brotli Compression (Super Fast - Best for modern browsers)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
    })
  ],
  
  // 🟢 NAYA UPDATE: Advanced Build Optimization & Chunk Splitting
  build: {
    target: 'esnext', // Modern browsers ke liye best performance
    minify: 'esbuild', // Fast and effective minification
    cssCodeSplit: true, // CSS ko bhi alag-alag files me todega
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // 1. Chart.js sabse heavy hai, usko ekdum alag file me feko
            if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
              return 'vendor-charts';
            }
            // 2. React Core files ko alag karo taaki turant render ho
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            // 3. Baaki bachi hui NPM libraries isme aayengi
            return 'vendor-others';
          }
        }
      }
    }
  }
})
