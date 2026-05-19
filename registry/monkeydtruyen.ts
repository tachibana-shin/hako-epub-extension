export default defineRegistry({
  domains: ["monkeydtruyen.com"],
  lang: "vi",
  findAuthor: () => undefined,
  findBlocks: "h2.card-title",
  findTarget: () => $(".list-chapters")!,
  extractCover: () => $(".card img")?.getAttribute("src") ?? undefined,
  findTags: () => Array.from($$("a.cate-item")).map((a) => a.textContent?.trim()),
  title: () => {
    const list = Array.from($$(".list-chapters .episode-title > a"))
    const end = list[0]?.textContent?.trim()?.replace(/\s+/g, " ").trim()
    const start = list.at(-1)?.textContent?.trim()?.replace(/\s+/g, " ").trim()
    if (!start || !end) return $("h2.card-title")?.textContent?.trim() ?? "Unknown"

    return `${start} ~ ${end}`
  },
  description: () => $("div[itemprop=description]")?.textContent?.trim(),
  fetcherOptions: {
    delayError429: 15_000
  },
  publisher: "monkeydtruyen.com",
  targetQueries: {
    bookTitle: "h2.card-title",
    chapters: ".episode-title > a",
    chaptersReverse: true,
    container: ($) => $(".actac").html() || $("#chapter-content-render").html()
  },
  cleaner: ($) => {
    $(".actac").attr("style", "")
    $("p.signature").remove()
  }
})
