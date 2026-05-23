import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    base: '/travel-planner/',
    plugins: [
      react(),
      {
        name: 'html-transform',
        transformIndexHtml(html) {
          return html
            .replace(/%VITE_AMAP_KEY%/g, env.VITE_AMAP_KEY || '9743956dbf6ba4884ce3fe44805f3259')
            .replace(/%VITE_AMAP_SECURITY_CODE%/g, env.VITE_AMAP_SECURITY_CODE || '76221f98de12890903bf93a3b01dccda')
        }
      },
    VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icons/*.png'],
        manifest: {
          name: '旅行规划',
          short_name: '旅行规划',
          description: '旅行前中后的完整规划工具',
          start_url: '/travel-planner/',
          scope: '/travel-planner/',
          lang: 'zh-CN',
          theme_color: '#667eea',
          background_color: '#faf9f7',
          display: 'standalone',
          orientation: 'portrait',
          icons: [
            { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
            { src: 'icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
          ]
        },
        devOptions: {
          enabled: true,
          type: 'module'
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
          navigateFallback: 'index.html',
          navigateFallbackDenylist: [/^\/api/]
        }
      })
    ],
    server: {
      host: true
    }
  }
})
