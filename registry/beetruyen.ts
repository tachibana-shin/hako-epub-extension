export default defineRegistry({
  domains: ["beetruyen.net"],
  lang: "vi",
  findAuthor: () =>
    Array.from($$(".tac-gia-ten")).map((author) => author.textContent!.trim()),
  findBlocks: ".mdv-san-pham-show-name",
  findTarget: () => $(".mvd-san-pham-show-danh-sach-chuong")!,
  extractCover: () =>
    $(".san-pham-book-item-show position-relative img")?.getAttribute("src") ??
    undefined,
  findTags: () =>
    Array.from($$(".san-pham-the-loai-item a")).map((a) =>
      a.textContent?.trim()
    ),
  title: () => {
    const list = Array.from($$(".mdv-san-pham-show-dsc-table-chuong-box"))
    const start = list[0]
      ?.querySelector("a")
      ?.textContent?.trim()
      ?.replace(/\s+/g, " ")
      .trim()
    const end = list
      .at(-1)
      ?.querySelector("a")
      ?.textContent?.trim()
      ?.replace(/\s+/g, " ")
      .trim()
    if (!start || !end)
      return $(".mdv-san-pham-show-name")?.textContent?.trim() ?? "Unknown"

    return `${start} ~ ${end}`
  },
  description: () =>
    $(".mdv-san-pham-show-gioi-thieu-des")?.textContent?.trim(),
  fetcherOptions: {
    sleep: 3_000,
    delayError429: 15_000
  },
  publisher: "beetruyen.net",
  targetQueries: {
    bookTitle: ".mdv-san-pham-show-name",
    chapters: ".mdv-san-pham-show-dsc-table-chuong > a",
    container: "#noi_dung_truyen"
  }
})
