/// <reference types="vitest" />

import { dirname, relative } from "node:path"
import type { UserConfig } from "vite"
import { defineConfig } from "vite"
import Vue from "@vitejs/plugin-vue"
import Icons from "unplugin-icons/vite"
import IconsResolver from "unplugin-icons/resolver"
import Components from "unplugin-vue-components/vite"
import { NaiveUiResolver } from "unplugin-vue-components/resolvers"
import AutoImport from "unplugin-auto-import/vite"
import arrayBuffer from "vite-plugin-arraybuffer"
import UnoCSS from "unocss/vite"
import { nodePolyfills } from "vite-plugin-node-polyfills"
import { isDev, port, r } from "./scripts/utils"
import packageJson from "./package.json"

export const sharedConfig: UserConfig = {
  root: r("src"),
  resolve: {
    alias: {
      "~/": `${r("src")}/`
    }
  },
  define: {
    "__DEV__": isDev,
    "__NAME__": JSON.stringify(packageJson.name),
    "process.env.NODE_ENV": JSON.stringify("production"),
    "process.platform": "unix"
  },
  plugins: [
    arrayBuffer(),
    nodePolyfills({ globals: { process: true } }),

    Vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith("x-")
        }
      }
    }),

    AutoImport({
      imports: [
        "vue",
        {
          "webextension-polyfill": [["=", "browser"]]
        }
      ],
      dts: r("src/auto-imports.d.ts")
    }),

    // https://github.com/antfu/unplugin-vue-components
    Components({
      dirs: [r("src/components")],
      // generate `components.d.ts` for ts support with Volar
      dts: r("src/components.d.ts"),
      resolvers: [
        // auto import icons
        IconsResolver({}),
        NaiveUiResolver()
      ]
    }),

    // https://github.com/antfu/unplugin-icons
    Icons(),

    // https://github.com/unocss/unocss
    UnoCSS(),

    // rewrite assets to use relative path
    {
      name: "assets-rewrite",
      enforce: "post",
      apply: "build",
      transformIndexHtml(html, { path }) {
        return html.replace(
          /"\/assets\//g,
          `"${relative(dirname(path), "/assets")}/`
        )
      }
    }
  ],
  optimizeDeps: {
    include: ["vue", "@vueuse/core", "webextension-polyfill"],
    exclude: ["vue-demi"]
  }
}

export default defineConfig(({ command }) => ({
  ...sharedConfig,
  base: command === "serve" ? `http://localhost:${port}/` : "/dist/",
  server: {
    port,
    hmr: {
      host: "localhost"
    },
    origin: `http://localhost:${port}`
  },
  build: {
    watch: isDev ? {} : undefined,
    outDir: r("extension/dist"),
    emptyOutDir: false,
    sourcemap: isDev ? "inline" : false,
    // https://developer.chrome.com/docs/webstore/program_policies/#:~:text=Code%20Readability%20Requirements
    terserOptions: {
      mangle: false
    },
    rollupOptions: {
      input: {
        options: r("src/options/index.html"),
        popup: r("src/popup/index.html"),
        sidepanel: r("src/sidepanel/index.html")
      }
    }
  },
  test: {
    globals: true,
    environment: "jsdom"
  }
}))
