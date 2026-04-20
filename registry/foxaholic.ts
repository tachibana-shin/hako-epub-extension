export default defineRegistry({
  domains: ["www.foxaholic.com", "foxaholic.com"],
  lang: "en",
  findAuthor: () =>
    Array.from(document.querySelectorAll(".author-content > a"))
      .map((a) => a.textContent.trim())
      .join(", "),
  findBlocks:
    ".volumns > li.parent:has(> .sub-chap.list-chap) > a.has-child:first-child",
  findTarget: (h3) =>
    h3.closest("li.parent")!.querySelector(".sub-chap.list-chap")!,
  extractCover: (_) =>
    document.querySelector(".summary_image img")!.getAttribute("data-src") ||
    undefined,
  publisher: "foxaholic.com",
  targetQueries: {
    bookTitle: ".post-title > h1",
    chapters: "li > a",
    chaptersReverse: true,
    container: ".foxaholic-bidgear-before-content-1x1"
  },
  title: (h3) => h3.textContent.trim(),
  description: () =>
    Array.from(
      document.querySelectorAll(".foxaholic-bidgear-before-content-1x1 p")
    )
      .map((v) => v.textContent.trim())
      .join("\n") ?? "",
  cleaner: ($) =>
    $(
      '.foxaholic-bidgear-before-content-1x1 > div[id^="bg-"], .foxaholic-bidgear-before-content-1x1 > div[id^="bg-"] ~ h1, .foxaholic-bidgear-before-content-1x1 > div[id^="bg-"] ~ h1 + h2'
    ).remove()
})
