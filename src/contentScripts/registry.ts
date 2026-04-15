import type { CheerioAPI } from "cheerio"

export interface FetcherOptions {
  concurrency?: number
  delayError429?: number
  retry?: number
  // time sleep after download one chapter
  sleep?: number
}
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
  transformContainer?: ($: CheerioAPI) => CheerioAPI
  preParse?: false | ((html: string) => string)
  getChapterTitle?: (anchor: HTMLElement) => string
  fetcherOptions?: FetcherOptions
  lazyDom?: boolean
}

const registry: SiteConfig[] = [
  {
    domains: ["hako.vn", "ln.hako.vn", "hako.vip", "docln.net", "docln.sbs"],
    findBlocks: ".volume-list:not(.disabled) > header > span.mobile-icon",
    findTarget: (h3) => h3.closest(".volume-list")!,
    fetcherOptions: {
      concurrency: 5,
      sleep: 3_000,
      delayError429: 15_000
    },
    preParse: false,
    transformContainer($) {
      // Decode utilities -----------------------------------------------------------

      // base64 → Uint8Array
      function decodeBase64ToBytes(b64: string) {
        const raw = atob(b64)
        const bytes = new Uint8Array(raw.length)
        for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i)
        return bytes
      }

      // Uint8Array → UTF-8 string
      function bytesToUtf8(bytes: Uint8Array) {
        return new TextDecoder("utf-8").decode(bytes)
      }

      // XOR decode with repeating key
      function xorDecode(b64Data: string, key: string) {
        const bytes = decodeBase64ToBytes(b64Data)
        const keyLen = key.length
        const out = new Uint8Array(bytes.length)

        for (let i = 0; i < bytes.length; i++) {
          out[i] = bytes[i] ^ key.charCodeAt(i % keyLen)
        }
        return bytesToUtf8(out)
      }

      // Choose decoding strategy
      function decodeChunk(data: string, strategy: string, key: string) {
        // data = base64 or reversed-base64 depending on strategy
        const prepared =
          strategy === "base64_reverse"
            ? data.split("").reverse().join("")
            : data

        if (strategy === "xor_shuffle") {
          return xorDecode(prepared, key)
        }

        // Normal base64 decode
        return bytesToUtf8(decodeBase64ToBytes(prepared))
      }

      const container = $("#chapter-c-protected")
      if (!container.length) return $

      // Get metadata
      const strategy = container.attr("data-s") || "none"
      const key = container.attr("data-k") || ""

      // Parse encoded chunks
      let chunks
      try {
        chunks = JSON.parse(container.attr("data-c") || "[]")
      } catch (err) {
        console.warn(err)
        return $
      }
      if (!Array.isArray(chunks) || chunks.length === 0) return $

      // Sort by prefix number (first 4 chars)
      chunks.sort((a, b) => {
        const idA = Number.parseInt(a.slice(0, 4), 10)
        const idB = Number.parseInt(b.slice(0, 4), 10)
        return idA - idB
      })

      // Decode all chunks
      const decodedList = chunks.map((item) => {
        const body = item.slice(4) // strip the "0001" prefix
        return decodeChunk(body, strategy, key)
      })

      // Merge decoded HTML
      const html = decodedList.join("")
      container.replaceWith($(`${html.trim()}`))

      return $
    }
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

      $("img").each((_, img) => {
        const $img = $(img)

        $img.attr("data-src", $img.attr("data-src")?.split("/revision/")[0])
        $img.attr("src", $img.attr("data-src")?.split("/revision/")[0])

        if ($img.parent().is("a")) {
          $img.parent().replaceWith($img)
        }
      })
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
  },
  {
    domains: ["novest.me"],
    findAuthor: () =>
      Array.from(document.querySelectorAll("a[href]"))
        .filter((a) => a.getAttribute("href")?.includes("author="))
        .map((a) => a.textContent.trim())
        .join(", "),
    findBlocks: `.space-y-4 > [data-orientation="vertical"] > h3 > button`,
    findTarget: (h3) =>
      h3
        .closest("div[data-orientation='vertical']")!
        .querySelector("div[id^=radix]")!,
    extractCover: (_) => {
      const src = document
        .querySelector(".aspect-\\[2\\/3\\] > img.object-cover")
        ?.getAttribute("src")
      if (!src) return

      return new URL(src, location.href).searchParams.get("url")?.toString()
    },
    publisher: "novest.me",
    targetQueries: {
      bookTitle: "h1",
      chapters: ".grid > a",
      container: ".relative"
    },
    title: (h3) => h3.querySelector("h3")!.textContent.trim(),
    description: () =>
      document
        .querySelector(".prose > .whitespace-pre-line")
        ?.textContent.trim() ?? "",
    getChapterTitle: (anchor: HTMLElement) =>
      anchor.querySelector(".text-sm")?.textContent.trim() ??
      anchor.textContent.trim(),
    lazyDom: true,
    fetcherOptions: {
      concurrency: 1,
      sleep: 5000
    }
  }
]

export default registry
