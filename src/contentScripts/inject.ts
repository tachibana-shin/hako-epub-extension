import { register } from "./ce/register"
import type { SiteConfig } from "./registry"
import registry from "./registry"

register()

function bind(config: SiteConfig) {
  const author = config.findAuthor?.()
  document.querySelectorAll<HTMLElement>(config.findBlocks).forEach((h3) => {
    if (h3.querySelector("download-volume")) return

    const id = crypto.randomUUID()
    const downloadVolume = document.createElement("download-volume")

    // ▲ v-id の付与（章リスト）
    const targetEl =
      config.findTarget?.(h3) ??
      h3.nextElementSibling ??
      h3.closest(".volume-list") ??
      h3
    targetEl.setAttribute("v-id", id)

    // ▼ download-volume attributes
    downloadVolume.setAttribute("target", id)
    if (config.publisher)
      downloadVolume.setAttribute("publisher", config.publisher)
    if (config.targetQueries?.bookTitle) {
      downloadVolume.setAttribute(
        "q-book-title",
        config.targetQueries.bookTitle
      )
    }
    if (config.targetQueries?.chapters)
      downloadVolume.setAttribute("q-chapters", config.targetQueries.chapters)
    if (config.targetQueries?.container)
      downloadVolume.setAttribute("q-container", config.targetQueries.container)

    // タイトル
    if (config.title) downloadVolume.setAttribute("title", config.title(h3))

    // 表紙
    const cover = config.extractCover?.(h3)
    if (cover) downloadVolume.setAttribute("cover", cover)

    // 著者
    if (author) downloadVolume.setAttribute("author", author)

    if (config.cleaner)
      (downloadVolume as unknown as any).cleaner = config.cleaner

    h3.appendChild(downloadVolume)
  })
}

let cron = false
function injector() {
  const config = registry.find((item) =>
    item.domains.includes(location.hostname)
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
