import { isSonako } from "./vars"
import { register } from "./ce/register"

register()
function injector() {
  if (isSonako) {
    document
      .querySelectorAll("h3:has(+ ul), h3:has(+ figure + ul)")
      .forEach((h3) => {
        if (h3.querySelector("download-volume")) return

        let ul = h3.nextElementSibling
        let cover: string | undefined

        if (ul && ul.tagName === "FIGURE") {
          cover =
            ul?.querySelector("img")?.getAttribute("data-src")?.trim() ??
            undefined
          ul = ul.nextElementSibling
        }

        if (ul && ul.tagName === "UL") {
          const downloadVolume = document.createElement("download-volume")

          const id = crypto.randomUUID()
          ul.setAttribute("v-id", id)

          downloadVolume.setAttribute("target", id)
          downloadVolume.setAttribute("title", h3.textContent.trim())
          if (cover)
            downloadVolume.setAttribute("cover", cover.split("/revision/")[0])
          downloadVolume.setAttribute("q-book-title", ".mw-page-title-main")
          downloadVolume.setAttribute("q-chapters", "li > a")
          downloadVolume.setAttribute("q-container", "#mw-content-text")
          downloadVolume.setAttribute("publisher", "sonako.fandom.com")

          h3.appendChild(downloadVolume)
        }
      })
  } else {
    document
      .querySelectorAll(
        ".volume-list:not(.disabled) > header > span.mobile-icon"
      )
      .forEach((icon) => {
        if (icon.querySelector("download-volume")) return

        const downloadVolume = document.createElement("download-volume")
        const volumeListEl = icon.closest(".volume-list")!

        const id = crypto.randomUUID()
        volumeListEl.setAttribute("v-id", id)

        downloadVolume.setAttribute("target", id)

        icon.appendChild(downloadVolume)
      })
  }
}

document.addEventListener("DOMContentLoaded", injector)
window.addEventListener("load", injector)

injector()
