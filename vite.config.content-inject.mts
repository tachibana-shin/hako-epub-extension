import type { Plugin } from "vite"
import { defineConfig } from "vite"
import packageJson from "./package.json"
import { buildCSS } from "./scripts/build-ce-css"
import { isDev, r } from "./scripts/utils"
import { sharedConfig } from "./vite.config.mjs"

function WatchVuePlugin(): Plugin {
  return {
    name: "watch-vue",
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

const processPolyfillCode = `
if (typeof globalThis.process === 'undefined') {
  globalThis.process = {
    env: { NODE_ENV: "production", HTTP_PROXY: undefined, http_proxy: undefined },
    cwd: () => '/',
    platform: 'browser',
    nextTick: (fn, ...args) => setTimeout(() => fn(...args), 0),
    argv: [],
    stdout: { write: () => {} },
    stderr: { write: () => {} },
    binding: () => { throw new Error('process.binding not supported'); },
    chdir: () => { throw new Error('process.chdir not supported'); },
    umask: () => 0
  };
}
`

function ProcessPolyfillPlugin(): Plugin {
  return {
    name: "process-polyfill",
    config() {
      return {
        build: {
          rollupOptions: {
            output: {
              banner: processPolyfillCode
            }
          }
        }
      }
    }
  }
}

export default defineConfig({
  ...sharedConfig,
  plugins: [
    ...sharedConfig.plugins!,
    WatchVuePlugin(),
    ProcessPolyfillPlugin()
  ],
  define: {
    __DEV__: isDev,
    __NAME__: JSON.stringify(packageJson.name),
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
