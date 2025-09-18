import { defineConfig } from "vite"
import type { Plugin } from "vite"
import { sharedConfig } from "./vite.config.mjs"
import { isDev, r } from "./scripts/utils"
import packageJson from "./package.json"
import { buildCSS } from "./scripts/build-ce-css"

function WatchVuePlugin(): Plugin {
  return {
    name: "watch-vue",
    // 日本語コメント: ファイル変更時に呼ばれるフック
    watchChange(id) {
      if (id.endsWith(".vue")) {
        buildCSS()
      }
    },
    buildStart() {
      console.log("✅ Build started (content script)")
    },
    buildEnd() {
      console.log("🏁 Build finished")
    }
  }
}
// bundling the content script using Vite
export default defineConfig({
  ...sharedConfig,
  plugins: [...sharedConfig.plugins!, WatchVuePlugin()],
  define: {
    "__DEV__": isDev,
    "__NAME__": JSON.stringify(packageJson.name),
    // https://github.com/vitejs/vite/issues/9320
    // https://github.com/vitejs/vite/issues/9186
    "process.env.NODE_ENV": JSON.stringify(isDev ? "development" : "production")
  },
  build: {
    watch: isDev ? {} : undefined,
    outDir: r("extension/dist/contentScripts"),
    cssCodeSplit: false,
    emptyOutDir: false,
    sourcemap: isDev ? "inline" : false,
    lib: {
      entry: r("src/contentScripts/inject.ts"),
      name: packageJson.name,
      formats: ["iife"]
    },
    rollupOptions: {
      output: {
        entryFileNames: "inject.global.js",
        assetFileNames: "inject.style.css",
        extend: true
      }
    }
  }
})
