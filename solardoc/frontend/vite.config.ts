import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import importMetaEnv from '@import-meta-env/unplugin'
import monacoPlugin from 'vite-plugin-monaco-editor'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    monacoPlugin({}),
    importMetaEnv.vite({
      example: ".env.template",
      env: ".env",
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    }
  }
})
