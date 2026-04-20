export default defineRegistry({
  domains: ["mimieuuyen.com"],
  lang: "vi",
  findAuthor: () => $("#author")?.textContent.trim(),
  findBlocks: "#storyTitle",
  findTarget: () => $("#chapterListGrid")!,
  extractCover: () => $("img#coverImage")?.getAttribute("src") ?? undefined,
  findTags: () =>
    Array.from($$("a.category-link")).map((a) => a.textContent?.trim()),
  title: () => {
    const list = Array.from($$("#chapterListGrid .chapter-cell > a"))
    const start = list[0]
      ?.querySelector(".chapter_name")
      ?.textContent?.trim()
      ?.replace(/\s+/g, " ")
      .trim()
    const end = list
      .at(-1)
      ?.querySelector(".chapter_name")
      ?.textContent?.trim()
      ?.replace(/\s+/g, " ")
      .trim()
    if (!start || !end) return $("title")?.textContent?.trim() ?? "Unknown"

    return `${start} ~ ${end}`
  },
  description: () => $("#description")?.textContent?.trim(),
  fetcherOptions: {
    delayError429: 15_000
  },
  publisher: "mimieuuyen.com",
  targetQueries: {
    bookTitle: "#storyTitle",
    chapters: ".chapter-cell > a",
    container: ($) => $("#chapter-c").html() || "<i>Chương này đã bị khoá</i>"
  },
  getChapterTitle: (a) => $(".chapter_name", a)?.textContent.trim() ?? "Unknown"
})
