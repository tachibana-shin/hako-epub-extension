export default defineRegistry({
  domains: ["valvrareteam.net"],
  lang: "vi",
  findAuthor: () => {
    return Array.from(document.querySelectorAll(".rd-author-name"))
      .map((span) => span.textContent.trim())
      .join(", ")
  },
  findBlocks: ".module-details .module-header",
  findTarget: (h3) =>
    h3.closest(".module-details")!.querySelector(".module-chapters-list")!,
  extractCover: (h3) =>
    h3
      .closest(".module-content")
      ?.querySelector(".module-cover-image")
      ?.getAttribute("src") || undefined,
  publisher: "valvrareteam.net",
  targetQueries: {
    bookTitle: ".rd-novel-title",
    chapters: ".chapter-list-content > a",
    container: ".chapter-content"
  },
  title: (h3) => h3.textContent.trim().replace(/\+$/, "").replace(/\+ H/, "H"),
  getChapterTitle(anchor) {
    const title: string[] = []
    for (const node of Array.from(anchor.childNodes)) {
      if (node instanceof HTMLElement && node.classList.contains("new-tag"))
        continue
      title.push(node.textContent?.trim() ?? "")
    }

    return title.join(" ")
  },
  lazyDom: true
})
