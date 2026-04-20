export default defineRegistry({
  domains: ["ln.3ktan.com"],
  lang: "vi",
  findAuthor: () => {
    return [
      ...Array.from(
        contains("strong", "Tác giả:")?.nextElementSibling?.querySelectorAll(
          "a"
        ) ?? []
      ),
      ...Array.from(
        contains("strong", "Họa sĩ:")?.nextElementSibling?.querySelectorAll(
          "a"
        ) ?? []
      )
    ].map((author) => author.textContent!.trim())
  },
  findBlocks: "#accordionVolume h2.accordion-header",
  findTarget: (h3) =>
    h3.closest(".accordion-item")!.querySelector(".accordion-collapse")!,
  extractCover: (_, target) => {
    const img = target.querySelector("img")?.getAttribute("src") ?? undefined

    // fallback to main poster
    if (!img || img.includes("no_image.jpg")) {
      return (
        document.querySelector("#main-content img")?.getAttribute("src") ??
        undefined
      )
    }

    return img
  },
  findTags: () =>
    Array.from(
      contains("strong", "Thể Loại:")?.nextElementSibling?.querySelectorAll(
        "a"
      ) ?? []
    ).map((a) => a.textContent!.trim()),
  title: (h3, _) => h3.textContent?.trim() ?? "",
  description: () =>
    document.querySelector(".summary-content")?.textContent?.trim(),
  fetcherOptions: {
    delayError429: 15_000
  },
  publisher: "ln.3ktan.com",
  targetQueries: {
    bookTitle: "h1.text-body",
    chapters: ".list-group > a",
    container: "#content_chapter > .reading-text"
  },
  getChapterTitle: (anchor) =>
    anchor.querySelector("span.fw-medium.text-body")!.textContent!.trim()
})
