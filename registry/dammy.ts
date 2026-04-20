export default defineRegistry({
  domains: ["dammy.me"],
  lang: "vi",
  findAuthor: () =>
    Array.from($$("a", contains("dt", "Tác giả")?.nextElementSibling)).map(
      (a) => a.textContent.trim()
    ),
  findBlocks: "h2.card-title",
  findTarget: () => $("#listChapters")!,
  extractCover: () =>
    $(".card img.img-fluid")?.getAttribute("src") ?? undefined,
  findTags: () =>
    Array.from($$("a.cate-item")).map((a) => a.textContent?.trim()),
  title: () => {
    const list = Array.from($$("#listChapters .episode-title > a"))
    const end = list[0]?.textContent?.trim()?.replace(/\s+/g, " ").trim()
    const start = list.at(-1)?.textContent?.trim()?.replace(/\s+/g, " ").trim()
    if (!start || !end) return $("title")?.textContent?.trim() ?? "Unknown"

    return `${start} ~ ${end}`
  },
  description: () => $("div[itemprop=description]")?.textContent?.trim(),
  fetcherOptions: {
    delayError429: 15_000
  },
  publisher: "dammy.me",
  targetQueries: {
    bookTitle: "title",
    chapters: ".episode-title > a",
    chaptersReverse: true,
    container: ($) =>
      $("div.affActive").html() || $("#chapter-content-render").html()
  },
  cleaner: ($) => {
    $(".affActive").attr("style", "")
    $("p.signature").remove()
  }
})
