import { createApp } from "vue"
import App from "./views/App.vue"
import { setupApp } from "~/logic/common-setup"

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
;

(() => {
  const script = document.createElement("script")
  document.documentElement.prepend(script)
  script.src = browser.runtime.getURL("dist/contentScripts/inject.global.js")

  const style = document.createElement("style")
  style.textContent = /* css */`
@media only screen and (min-width: 999.01px) {
  .volume-list .sect-header {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
  }
  .volume-list .sect-header .mobile-icon {
    order: 2 !important;
    font-size: 20px !important;
  }
}`
  document.documentElement.appendChild(style)

  // mount component to context window
  const container = document.createElement("div")
  container.id = __NAME__
  const root = document.createElement("div")
  const styleEl = document.createElement("link")
  const shadowDOM =
    container.attachShadow?.({ mode: __DEV__ ? "open" : "closed" }) || container
  styleEl.setAttribute("rel", "stylesheet")
  styleEl.setAttribute(
    "href",
    browser.runtime.getURL("dist/contentScripts/style.css")
  )
  shadowDOM.appendChild(styleEl)
  shadowDOM.appendChild(root)
  document.documentElement.appendChild(container)
  const app = createApp(App)
  setupApp(app)
  app.mount(root)
})()
