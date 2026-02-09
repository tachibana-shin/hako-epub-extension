import { isBakaTsuki, isSonako } from "./vars"

import { register } from "./ce/register"

register()
function injector() {
  if (isSonako) {
    const author = Array.from(document.querySelectorAll("h2"))
      .find((t) => t.textContent?.includes("viết bởi"))
      ?.textContent?.split("viết bởi")
      .at(-1)
      ?.trim()
    document
      .querySelectorAll(
        "h3:has(+ ul), h3:has(+ figure + ul), h3:has(+ figure + * + ul), h3:has(+ figure + table), h3:has(+ figure + * + table)"
      )
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

        while (ul && ul.tagName !== "UL" && ul.tagName !== "TABLE") {
          ul = ul.nextElementSibling
        }

        if (ul === null) return false

        const downloadVolume = document.createElement("download-volume")

        const id = crypto.randomUUID()
        ul.setAttribute("v-id", id)

        downloadVolume.setAttribute("target", id)
        downloadVolume.setAttribute("title", h3.textContent.trim())
        if (cover)
          downloadVolume.setAttribute("cover", cover.split("/revision/")[0])
        if (author) downloadVolume.setAttribute("author", author)
        downloadVolume.setAttribute("q-book-title", ".mw-page-title-main")
        downloadVolume.setAttribute("q-chapters", "li > a")
        downloadVolume.setAttribute("q-container", "#mw-content-text")
        downloadVolume.setAttribute("publisher", "baka-tsuki.org")

        h3.appendChild(downloadVolume)
      })
  } else if (isBakaTsuki) {
    const author = Array.from(document.querySelectorAll("h2 > .mw-headline"))
      .find((t) => t.textContent?.includes("series by"))
      ?.textContent?.split("series by")
      .at(-1)
      ?.trim()
    document.querySelectorAll("h3:has(+ dl)").forEach((h3) => {
      if (h3.querySelector("download-volume")) return

      const figure = h3.previousElementSibling
      let cover: string | undefined

      if (figure?.tagName === "FIGURE") {
        cover =
          figure
            ?.querySelector("img")
            ?.getAttribute("src")
            ?.trim()
            .replace(/(width|height)=\d*/gi, "width=800") ?? undefined
      }

      const downloadVolume = document.createElement("download-volume")

      const dl = h3.nextElementSibling!

      const id = crypto.randomUUID()
      dl.setAttribute("v-id", id)

      downloadVolume.setAttribute("target", id)
      downloadVolume.setAttribute(
        "title",
        Array.from(h3.querySelector(".mw-headline")?.childNodes ?? [])
          .filter((n) => n.nodeType === document.TEXT_NODE)
          .map((n) => n.textContent?.trim())
          .filter(Boolean)
          .join(" ")
          .trim()
          .replace(/\(\s*\)/g, "")
          .trim()
      )
      if (cover) downloadVolume.setAttribute("cover", cover)
      if (author) downloadVolume.setAttribute("author", author)
      downloadVolume.setAttribute("q-book-title", ".mw-page-title-main")
      downloadVolume.setAttribute("q-chapters", "li > a")
      downloadVolume.setAttribute("q-container", "#mw-content-text")
      downloadVolume.setAttribute("publisher", "sonako.fandom.com")

      h3.appendChild(downloadVolume)
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
