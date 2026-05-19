export default defineRegistry({
  domains: ["mintteanovel.com"],
  lang: "vi",
  findAuthor: () =>
    Array.from($$(".author-content a"))
      .map((a) => a.textContent?.trim())
      .join(", "),
  findBlocks: ".post-title",
  findTarget: () => $("ul.version-chap")!,
  extractCover: () => $(".summary_image img")?.getAttribute("src") ?? undefined,
  findTags: () => Array.from($$(".genres-content a")).map((a) => a.textContent?.trim()),
  title: () => {
    const list = Array.from($$("ul.version-chap > li > a"))
    const end = list[0]?.textContent?.trim()?.replace(/\s+/g, " ").trim()
    const start = list.at(-1)?.textContent?.trim()?.replace(/\s+/g, " ").trim()
    if (!start || !end) return $(".post-title h1")?.textContent?.trim() ?? "Unknown"

    return `${start} ~ ${end}`
  },
  description: () => $(".summary__content")?.textContent?.trim(),
  fetcherOptions: {
    delayError429: 15_000
  },
  publisher: "mintteanovel.com",
  targetQueries: {
    bookTitle: ".post-title h1",
    chapters: "li > a",
    chaptersReverse: true,
    container: ".reading-content .text-left"
  }
})
