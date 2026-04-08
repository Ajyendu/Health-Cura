import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const localBackend = 'http://localhost:8005'

/** Do not proxy React Router paths that sit under the same prefix as legacy `/doctor` APIs. */
const doctorProxy = {
  target: localBackend,
  changeOrigin: true,
  bypass(req) {
    const pathname = (req.url || '').split('?')[0] || ''
    if (
      req.method === 'GET' &&
      /^\/doctor\/(login|register|dashboard|profile)\/?$/.test(pathname)
    ) {
      return '/index.html'
    }
  },
}

const devProxy = {
  '/api': { target: localBackend, changeOrigin: true },
  '/uploads': { target: localBackend, changeOrigin: true },
  '/appointment': { target: localBackend, changeOrigin: true },
  '/doctor': doctorProxy,
  '/users': { target: localBackend, changeOrigin: true },
}

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
  server: { proxy: devProxy },
  preview: { proxy: devProxy },
})
