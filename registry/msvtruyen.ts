export default defineRegistry({
  domains: ["msvtruyen.com"],
  lang: "vi",
  findAuthor: () => Array.from($$("a", contains("p", "Tác Giả:"))).map((a) => a.textContent.trim()),
  findBlocks: "#chapters .heading",
  findTarget: (heading) => heading.nextElementSibling! as HTMLElement,
  extractCover: () => $("img.img-fluid")?.getAttribute("src") ?? undefined,
  findTags: () => Array.from($$("a.badge")).map((a) => a.textContent?.trim()),
  title: (_, target) => {
    const list = Array.from($$("tr a", target))
    const end = list[0]?.textContent?.trim()?.replace(/\s+/g, " ").trim()
    const start = list.at(-1)?.textContent?.trim()?.replace(/\s+/g, " ").trim()
    if (!start || !end) return "Unknown"

    return `${start} ~ ${end}`
  },
  description: () => $('div[itemprop="articleBody"]')?.textContent?.trim(),
  fetcherOptions: {
    delayError429: 15_000
  },
  publisher: "msvtruyen.com",
  targetQueries: {
    bookTitle: "h1",
    chapters: "tr a",
    chaptersReverse: true,
    container: ($) => $("#chapter-content").html() || "<i>Chương này đã bị khoá</i>"
  }
})
