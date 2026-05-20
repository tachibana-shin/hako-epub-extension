export default defineRegistry({
  domains: ["truyenqqko.com", "truyenqqvip.com", "truyenqqpro.com"],
  lang: "vi",
  cbz: true,
  findAuthor: () => {
    const list = $$("a", contains(".info-item", "Tác giả"))
    return Array.from(list).map((a) => a.textContent!.trim())
  },
  findBlocks: ".book_info h1",
  findTarget: () => $(".works-chapter-list")!,
  extractCover: () => $(".book_avatar img")?.getAttribute("src") ?? undefined,
  findTags: () => Array.from($$(".list-01 a")).map((a) => a.textContent?.trim() || ""),
  title: () => {
    const list = Array.from($$(".works-chapter-list .name-chap a"))
    const end = list[0]?.textContent?.trim()?.replace(/\s+/g, " ").trim()
    const start = list.at(-1)?.textContent?.trim()?.replace(/\s+/g, " ").trim()
    if (!start || !end) return $(".book_info h1")?.textContent?.trim() ?? "Unknown"

    return `${start} ~ ${end}`
  },
  description: () => $(".story-detail-info")?.textContent?.trim(),
  fetcherOptions: {
    delayError429: 15_000,
    concurrency: 5
  },
  publisher: "truyenqqko.com",
  targetQueries: {
    bookTitle: ".book_info h1",
    chapters: ".works-chapter-list .name-chap a",
    chaptersReverse: true,
    container: ".chapter_content"
  }
})
