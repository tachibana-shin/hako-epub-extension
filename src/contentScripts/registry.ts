import type { CheerioAPI } from "cheerio"

export interface SiteConfig {
  domains: string[]
  findAuthor?: () => string | undefined
  findBlocks: string
  findTarget: (h3: HTMLElement) => HTMLElement
  extractCover?: (h3: HTMLElement) => string | undefined
  publisher?: string
  targetQueries?: {
    bookTitle?: string
    chapters?: string
    chaptersReverse?: boolean
    container?: string
  }
  title?: (h3: HTMLElement) => string
  description?: () => string
  cleaner?: ($: CheerioAPI) => void
  lazyDom?: boolean
}

const registry: SiteConfig[] = [
  {
    domains: ["hako.vn", "hako.vip", "docln.net", "docln.sbs"],
    findBlocks: ".volume-list:not(.disabled) > header > span.mobile-icon",
    findTarget: (h3) => h3.closest(".volume-list")!
  },
  {
    domains: ["sonako.fandom.com"],
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
      "h3:has(+ ul), h3:has(+ figure + ul), h3:has(+ figure + * + ul), h3:has(+ figure + table), h3:has(+ figure + * + table)",
    findTarget: (h3) => {
      let ul = h3.nextElementSibling

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
        return ul
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
    },
    title: (h3) => h3.textContent.trim().replace("[]", "")
  },
  {
    domains: ["baka-tsuki.org", "www.baka-tsuki.org"],
    findAuthor: () => {
      return Array.from(document.querySelectorAll("h2 > .mw-headline"))
        .find((t) => t.textContent?.includes("series by"))
        ?.textContent?.split("series by")
        .at(-1)
        ?.trim()
    },
    findBlocks: "h3:has(+ dl)",
    findTarget: (h3) => h3.nextElementSibling! as HTMLElement,
    extractCover: (h3) => {
      const fig = h3.previousElementSibling
      if (fig?.tagName === "FIGURE") {
        return fig
          .querySelector("img")
          ?.getAttribute("src")
          ?.replace(/(width|height)=\d*/gi, "width=800")
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
    },
    title: (h3) =>
      Array.from(h3.querySelector(".mw-headline")?.childNodes ?? [])
        .filter((n) => n.nodeType === document.TEXT_NODE)
        .map((n) => n.textContent?.trim())
        .filter(Boolean)
        .join(" ")
        .trim()
        .replace(/\(\s*\)/g, "")
        .trim()
  },
  {
    domains: ["valvrareteam.net"],
    findAuthor: () => {
      return Array.from(document.querySelectorAll(".rd-author-name"))
        .map((span) => span.textContent.trim())
        .join(", ")
    },
    findBlocks: ".module-details .module-header",
    findTarget: (h3) => h3.closest(".module-details .module-chapters-list")!,
    extractCover: (h3) =>
      h3
        .closest(".module-content")
        ?.querySelector(".module-cover-image")
        ?.getAttribute("src") || undefined,
    publisher: "valvrareteam.net",
    targetQueries: {
      bookTitle: ".rd-novel-title",
      chapters: ".chapter-list-content > a",
      container: ".chapter-content"
    },
    title: (h3) =>
      h3.textContent.trim().replace(/\+$/, "").replace(/\+ H/, "H"),
    lazyDom: true
  },
  {
    domains: ["www.foxaholic.com", "foxaholic.com"],
    findAuthor: () =>
      Array.from(document.querySelectorAll(".author-content > a"))
        .map((a) => a.textContent.trim())
        .join(", "),
    findBlocks:
      ".volumns > li.parent:has(> .sub-chap.list-chap) > a.has-child:first-child",
    findTarget: (h3) =>
      h3.closest("li.parent")!.querySelector(".sub-chap.list-chap")!,
    extractCover: (_) =>
      document.querySelector(".summary_image img")!.getAttribute("data-src") ||
      undefined,
    publisher: "foxaholic.com",
    targetQueries: {
      bookTitle: ".post-title > h1",
      chapters: "li > a",
      chaptersReverse: true,
      container: ".foxaholic-bidgear-before-content-1x1"
    },
    title: (h3) => h3.textContent.trim(),
    description: () =>
      Array.from(
        document.querySelectorAll(".foxaholic-bidgear-before-content-1x1 p")
      )
        .map((v) => v.textContent.trim())
        .join("\n") ?? "",
    cleaner: ($) =>
      $(
        '.foxaholic-bidgear-before-content-1x1 > div[id^="bg-"], .foxaholic-bidgear-before-content-1x1 > div[id^="bg-"] ~ h1, .foxaholic-bidgear-before-content-1x1 > div[id^="bg-"] ~ h1 + h2'
      ).remove()
  }
]

export default registry
