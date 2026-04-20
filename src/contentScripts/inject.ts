import { toast } from "vue-sonner"
import { register } from "./ce/register"
import type { SiteConfig } from "./registry"
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

let cron = false
function injector() {
  const hostname = location.hostname.replace(/^www\./, "")
  const config = registry.find(
    (item) =>
      item.domains.includes(location.hostname) ||
      item.domains.includes(hostname)
  )
  if (!config) return console.warn("This domain not exists registry")

  if (config.lazyDom && !cron) {
    cron = true
    setInterval(() => bind(config), 1e3)
  }

  bind(config)
}

document.addEventListener("DOMContentLoaded", injector)
window.addEventListener("load", injector)

injector()
