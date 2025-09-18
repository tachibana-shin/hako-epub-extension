// import { onMessage } from "webext-bridge/background"
// import { setMany } from "idb-keyval"

import { isFirefox } from "~/env"
import { initiatorDomains } from "~/manifest"

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import("/@vite/client")
  // load latest content script
  import("./contentScriptHMR")
}

if (isFirefox) {
  browser.webRequest.onHeadersReceived.addListener(
    (details) => {
      const initiator = details.initiator || details.originUrl || ""

      if (!initiatorDomains.some((domain) => initiator.includes(domain))) {
        return {}
      }

      return {
        responseHeaders: [
          { name: "access-control-allow-origin", value: "*" },
          {
            name: "access-control-allow-methods",
            value: "GET, POST, OPTIONS, HEAD, PUT, DELETE, PATCH"
          },
          { name: "access-control-allow-headers", value: "*" }
        ]
      }
    },
    {
      urls: ["*://*/*#cors*"],
      types: ["xmlhttprequest", "image", "media"]
    },
    ["blocking", "responseHeaders"]
  )
}
else {
  const rules = [
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

  // eslint-disable-next-line ts/ban-ts-comment
  // @ts-expect-error
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1],
    addRules: rules
  })
}

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
