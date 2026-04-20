export default defineRegistry({
  domains: ["luvevaland.co"],
  lang: "vi",
  findAuthor: () =>
    $("a", contains("div.book__detail-text", "Tác giả:"))?.textContent.trim(),
  findBlocks: ".book__detail-name",
  findTarget: () => $("#chapter-list-container")!,
  extractCover: () =>
    $(".book__detail-image img")?.getAttribute("src") ?? undefined,
  findTags: () =>
    Array.from($$("a", contains(".book__detail-text", "Tag:"))).map((a) =>
      a.textContent?.trim()
    ),
  title: () => {
    const list = Array.from(
      $$("#chapter-list-container .list-chapter__name > a")
    )
    const start = list[0]?.textContent?.trim()?.replace(/\s+/g, " ").trim()
    const end = list.at(-1)?.textContent?.trim()?.replace(/\s+/g, " ").trim()
    if (!start || !end) return $("title")?.textContent?.trim() ?? "Unknown"

    return `${start} ~ ${end}`
  },
  description: () => $(".tab-comic-description")?.textContent?.trim(),
  fetcherOptions: {
    delayError429: 15_000
  },
  publisher: "luvevaland.co",
  targetQueries: {
    bookTitle: ".book__detail-name",
    chapters: ".list-chapter__name > a",
    container: "#chapter-content"
  }
})
