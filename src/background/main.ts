// import { onMessage } from "webext-bridge/background"
// import { setMany } from "idb-keyval"

import initiatorDomains from "../../registry?registry-domains"
import { checkForUpdate, STORAGE_KEY } from "~/logic/check-update"
import { DeclarativeNetRequest } from "webextension-polyfill"

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import("/@vite/client")
  // load latest content script
  import("./contentScriptHMR")
}

const rules: DeclarativeNetRequest.Rule[] = [
  {
    id: 1,
    priority: 1,
    action: {
      type: "modifyHeaders",
      responseHeaders: [
        {
          header: "access-control-allow-origin",
          operation: "set",
          value: "*"
        },
        {
          header: "access-control-allow-methods",
          operation: "set",
          value: "GET, POST, OPTIONS, HEAD, PUT, DELETE, PATCH"
        },
        {
          header: "access-control-allow-headers",
          operation: "set",
          value: "*"
        }
      ]
    },
    condition: {
      urlFilter: "#cors|",
      initiatorDomains,
      resourceTypes: ["xmlhttprequest", "image", "media"]
    }
  }
]

browser.declarativeNetRequest.updateDynamicRules({
  removeRuleIds: [1],
  addRules: rules
})

async function runUpdateCheck() {
  const info = await checkForUpdate()
  if (info.hasUpdate) {
    await browser.storage.local.set({ [STORAGE_KEY]: info })
  }
}

browser.alarms.create("check-update", { periodInMinutes: 360 })
browser.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "check-update") runUpdateCheck()
})

runUpdateCheck()

// // remove or turn this off if you don't use side panel
// const USE_SIDE_PANEL = true

// // to toggle the sidepanel with the action button in chromium:
// if (USE_SIDE_PANEL) {
//   // @ts-expect-error missing types
//   browser.sidePanel
//     .setPanelBehavior({ openPanelOnActionClick: true })
//     .catch((error: unknown) => console.error(error))
// }

// onMessage("save-volume", async ({ data: { slug, options, file } }) => {
//   await setMany([
//     [slug, JSON.stringify(options)],
//     [`${slug}_file`, file]
//   ])

//   return { ok: true }
// })
