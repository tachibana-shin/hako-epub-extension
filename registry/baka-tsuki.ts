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
  findBlocks:
    "h3:has(+ ul), h3:has(+ figure + ul), h3:has(+ figure + * + ul), h3:has(+ figure + table), h3:has(+ figure + * + table)" +
    ", .wds-tabber > .wds-tab__content > h3:has(+ .volume)",
  findTarget: (h3) => {
    let ul = h3.nextElementSibling

    if (ul?.classList.contains("volume")) return ul as HTMLElement

    if (ul && ul.tagName === "FIGURE") {
      ul = ul.nextElementSibling
    }

    while (ul && ul.tagName !== "UL" && ul.tagName !== "TABLE") {
      ul = ul.nextElementSibling
    }

    if (ul === null) throw new Error("Can't find target")

    return ul as HTMLElement
  },
  extractCover: (h3) => {
    // 表紙画像の抽出
    const ul = h3.nextElementSibling
    if (ul && ul.tagName === "FIGURE") {
      return ul.querySelector("img")?.getAttribute("src") ?? undefined
    }
    if (ul && ul.classList.contains("volume")) {
      return ul.querySelector("img")?.getAttribute("src") ?? undefined
    }
    return undefined
  },
  publisher: "baka-tsuki.org",
  targetQueries: {
    bookTitle: ".mw-page-title-main",
    chapters: "li > a",
    container: "#mw-content-text"
  },
  cleaner: ($) => {
    $(".wikitable, .mw-editsection, .printfooter").remove()
    $("#toc + h2, #toc, .mw-parser-output[lang] + h2").remove()

    $("h2:first-child:has(.mw-headline)").remove()

    $("img").each((_, img) => {
      const $img = $(img)

      if ($img.parent().is("a")) {
        $img.parent().replaceWith($img)
      }
    })
  },
  title: (h3) =>
    Array.from(h3.querySelector(".mw-headline")?.childNodes ?? [])
      .filter((n) => n.nodeType === document.TEXT_NODE)
      .map((n) => n.textContent?.trim())
      .filter(Boolean)
      .join(" ")
      .trim()
      .replace(/\([\s_\-]*\)/g, "")
      .trim()
})
