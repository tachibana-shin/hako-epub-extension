// eslint-disable-next-line ts/ban-ts-comment
// @ts-expect-error
import sonako from "./sonako.ts"

export default defineRegistry({
  domains: ["baka-tsuki.org", "www.baka-tsuki.org"],
  lang: "en",
  findAuthor: () => {
    return Array.from(document.querySelectorAll("h2 > .mw-headline"))
      .find((t) => t.textContent?.includes("series by"))
      ?.textContent?.split("series by")
      .at(-1)
      ?.trim()
  },
  findBlocks: sonako.findBlocks,
  findTarget: sonako.findTarget,
  extractCover: (h3) => {
    // 表紙画像の抽出
    const ul = h3.nextElementSibling
    if (ul && ul.tagName === "FIGURE") {
      return (
        ul
          .querySelector("img")
          ?.getAttribute("src")
          ?.replace(/(width|height)=\d*/gi, "width=800") ?? undefined
      )
    }
    if (ul && ul.tagName === "DL") {
      const prev = h3.previousElementSibling
      if (prev && prev.tagName === "FIGURE") {
        return (
          prev
            .querySelector("img")
            ?.getAttribute("src")
            ?.replace(/(width|height)=\d*/gi, "width=800") ?? undefined
        )
      }
    }
    if (ul && ul.classList.contains("volume")) {
      return (
        ul
          .querySelector("img")
          ?.getAttribute("src")
          ?.replace(/(width|height)=\d*/gi, "width=800") ?? undefined
      )
    }
    return undefined
  },
  publisher: "baka-tsuki.org",
  targetQueries: sonako.targetQueries,
  cleaner: ($) => {
    $(".wikitable, .mw-editsection, .printfooter").remove()
    $("#toc + h2, #toc, .mw-parser-output[lang] + h2").remove()

    $("h2:first-child:has(.mw-headline)").remove()

    $("img").each((_, img) => {
      const $img = $(img)
      $img.attr("src", $img.attr("src")?.replace(/(width|height)=\d*/gi, "width=800"))
      $img.attr("data-src", $img.attr("data-src")?.replace(/(width|height)=\d*/gi, "width=800"))
    })
  },
  title: (h3) =>
    Array.from(h3.querySelector(".mw-headline")?.childNodes ?? [])
      .filter((n) => n.nodeType === document.TEXT_NODE)
      .map((n) => n.textContent?.trim())
      .filter(Boolean)
      .join(" ")
      .trim()
      .replace(/\([\s_-]*\)/g, "")
      .trim()
})
