import type { Manifest } from "webextension-polyfill"
import fs from "fs-extra"
import { isDev, isFirefox, port, r } from "../scripts/utils"

import type PkgType from "../package.json"

export const initiatorDomains = [
  "hako.vn",
  "hako.vip",
  "docln.net",
  "docln.sbs",
  "sonako.fandom.com",
  "www.baka-tsuki.org"
]
const host_permissions = initiatorDomains
  .map((domain) => [`https://${domain}/*`, `https://*.${domain}/*`])
  .flat(1)

export async function getManifest() {
  const pkg = (await fs.readJSON(r("package.json"))) as typeof PkgType

  // update this file to update this manifest.json
  // can also be conditional based on your need
  const manifest: Manifest.WebExtensionManifest = {
    manifest_version: 3,
    name: pkg.displayName || pkg.name,
    version: pkg.version,
    description: pkg.description,
    // action: {
    //   default_icon: "assets/icon-512.png",
    //   default_popup: "dist/popup/index.html"
    // },
    // options_ui: {
    //   page: "dist/options/index.html",
    //   open_in_tab: true
    // },
    background: isFirefox
      ? {
          scripts: ["dist/background/index.mjs"],
          type: "module"
        }
      : {
          service_worker: "dist/background/index.mjs"
        },
    icons: {
      16: "assets/icon-114.png",
      48: "assets/icon-114.png",
      128: "assets/icon-114.png"
    },
    permissions: [
      "tabs",
      // "storage",
      "activeTab",
      // "sidePanel",
      "declarativeNetRequest"
    ],
    host_permissions: ["*://*/*"],
    content_scripts: [
      {
        matches: host_permissions,
        js: ["dist/contentScripts/index.global.js"],
        all_frames: true,
        run_at: "document_start"
      }
    ],
    web_accessible_resources: [
      {
        resources: [
          "dist/contentScripts/style.css",
          "dist/contentScripts/inject.global.js"
        ],
        matches: host_permissions
      }
    ],
    content_security_policy: {
      extension_pages: isDev
        ? // this is required on dev for Vite script to load
        `script-src \'self\' http://localhost:${port}; object-src \'self\'`
        : "script-src 'self'; object-src 'self'"
    }
  }

  // // add sidepanel
  // if (isFirefox) {
  //   manifest.sidebar_action = {
  //     default_panel: "dist/sidepanel/index.html"
  //   }
  // }
  // else {
  //   // the sidebar_action does not work for chromium based
  //   ;(manifest as any).side_panel = {
  //     default_path: "dist/sidepanel/index.html"
  //   }
  // }

  // FIXME: not work in MV3
  if (isDev && false) {
    // for content script, as browsers will cache them for each reload,
    // we use a background script to always inject the latest version
    // see src/background/contentScriptHMR.ts
    delete manifest.content_scripts
    manifest.permissions?.push("webNavigation")
  }

  return manifest
}
