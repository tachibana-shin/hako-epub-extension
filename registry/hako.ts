export default defineRegistry({
  domains: ["hako.vn", "ln.hako.vn", "hako.vip", "docln.net", "docln.sbs"],
  lang: "vi",
  findAuthor: () => {
    const infoItems = Array.from(document.querySelectorAll(".info-item"))
    return Array.from(
      infoItems
        .find((info) => info.querySelector(".info-name")?.textContent?.includes("Tác giả:"))
        ?.querySelector(".info-value")
        ?.querySelectorAll("a, span") ?? []
    ).map((el) => el.textContent!.trim())
  },
  findBlocks: ".volume-list:not(.disabled) > header > span.mobile-icon",
  findTarget: (h3) => h3.closest(".volume-list")!,
  extractCover: (_, target) => {
    const cover = target
      .querySelector(".volume-cover .content")
      ?.getAttribute("style")
      ?.match(/url\(["'](.+)["']\)/)?.[1]

    if (!cover || cover.includes("nocover.jpg")) {
      return document
        .querySelector(".series-cover .content")
        ?.getAttribute("style")
        ?.match(/url\(["'](.+)["']\)/)?.[1]
    }

    return cover
  },
  findTags: () =>
    Array.from(document.querySelectorAll(".series-gerne-item"))
      .map((a) =>
        a
          .textContent!.trim()
          .split(";")
          .map((item) => item.trim())
      )
      .flat(1)
      .filter(Boolean),
  title: (_, target) => target.querySelector(".sect-title")!.textContent!.trim(),
  description: () => document.querySelector(".summary-content")?.textContent?.trim(),
  fetcherOptions: {
    concurrency: 1,
    sleep: 2_000,
    delayError429: 15_000
  },
  targetQueries: {
    bookTitle: ".series-name",
    chapters: "ul.list-chapters li > .chapter-name > a",
    container: "#chapter-content"
  },
  publisher: "hako.vn",
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

    // Choose decoding strategyreadme
    function decodeChunk(data: string, strategy: string, key: string) {
      // data = base64 or reversed-base64 depending on strategy
      const prepared = strategy === "base64_reverse" ? data.split("").reverse().join("") : data

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
})
