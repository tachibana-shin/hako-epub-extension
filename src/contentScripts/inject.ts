import type { SiteConfig } from "./registry"
import { toast } from "vue-sonner"
import { register } from "./ce/register"
import registry from "./registry"

register()

function bind(config: SiteConfig) {
  document.querySelectorAll<HTMLElement>(config.findBlocks).forEach((h3) => {
    if (h3.querySelector("download-volume")) return

    const id = crypto.randomUUID()
    const downloadVolume = document.createElement("download-volume")

    // ▲ v-id の付与（章リスト）
    const targetEl = config.findTarget(h3)
    if (!targetEl) {
      toast("Target not found", {
        description: "Please check config"
      })

      return
    }

    targetEl.setAttribute("v-id", id)

    downloadVolume.setAttribute("target", id)

    const anyVolume = downloadVolume as any
    anyVolume.config = config
    anyVolume.source = h3

    h3.appendChild(downloadVolume)
  })
}

let watching = false
function injector() {
  const hostname = location.hostname.replace(/^www\./, "")
  const config = registry.find(
    (item) => item.domains.includes(location.hostname) || item.domains.includes(hostname)
  )
  if (!config) return console.warn("This domain not exists registry")

  if (config.customStyle) {
    if (document.getElementById("hako-epub-extension-style")) return

    const style = document.createElement("style")
    style.setAttribute("id", "hako-epub-extension-style")
    style.textContent = config.customStyle
    document.head.appendChild(style)
  }

  if (config.lazyDom && !watching) {
    watching = true
    let pending = true
    const observer = new MutationObserver(() => {
      if (pending) {
        pending = false
        requestAnimationFrame(() => {
          bind(config)
          pending = true
        })
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })
  }

  bind(config)
}

document.addEventListener("DOMContentLoaded", injector)
window.addEventListener("load", injector)

injector()
