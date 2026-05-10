export default defineRegistry({
  domains: ["sonako.fandom.com"],
  lang: "vi",
  findAuthor: () => {
    // 著者名の抽出
    return Array.from(document.querySelectorAll("h2"))
      .find((t) => t.textContent?.includes("viết bởi"))
      ?.textContent?.split("viết bởi")
      .at(-1)
      ?.trim()
      .replace("[]", "")
  },
  findBlocks:
    "h3:has(+ ul), h3:has(+ figure + ul), h3:has(+ figure + * + ul), " +
    "h3:has(+ figure + table), h3:has(+ figure + * + table), " +
    "h3:has(+ p + ul), h3:has(+ p + * + ul), h3:has(+ p + table), h3:has(+ p + * + table), " +
    ".wds-tabber > .wds-tab__content > h3:has(+ .volume)",
  findTarget: (h3) => {
    let ul = h3.nextElementSibling

    if (ul?.classList.contains("volume")) return ul as HTMLElement

    if (ul && ul.tagName === "FIGURE") {
      ul = ul.nextElementSibling
    }

    if (ul && ul.tagName === "P") {
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
      return ul
        .querySelector("img")
        ?.getAttribute("data-src")
        ?.split("/revision/")[0]
    }
    if (ul && ul.classList.contains("volume")) {
      return ul
        .querySelector("img")
        ?.getAttribute("data-src")
        ?.split("/revision/")[0]
    }
    const prev = h3.previousElementSibling
    if (prev?.tagName === "FIGURE") {
      return prev
        .querySelector("img")
        ?.getAttribute("data-src")
        ?.split("/revision/")[0]
    }
    return undefined
  },
  publisher: "sonako.fandom.com",
  targetQueries: {
    bookTitle: ".mw-page-title-main",
    chapters: "li > a",
    container: "#mw-content-text"
  },
  cleaner: ($) => {
    $(".dotEPUBremove, .mw-editsection").remove()
    // sonako not need toc default
    $("#toc + h2, #toc, .mw-parser-output[lang] + h2").remove()

    $("h3:contains(Ghi chú):not(h3:has(+ .mw-references-wrap))").remove()

    $("h2:first-child:has(.mw-headline)").remove()

    $("img").each((_, img) => {
      const $img = $(img)
      $img.attr("src", $img.attr("src")?.split("/revision/")[0])
      $img.attr("data-src", $img.attr("data-src")?.split("/revision/")[0])
    })
  },
  title: (h3) => h3.textContent.trim().replace("[]", "")
})
