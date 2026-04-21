export default defineRegistry({
  domains: ["novest.me"],
  lang: "vi",
  findAuthor: () =>
    Array.from(document.querySelectorAll("a[href]"))
      .filter((a) => a.getAttribute("href")?.includes("author="))
      .map((a) => a.textContent.trim())
      .join(", "),
  findBlocks: `.space-y-4 > [data-orientation="vertical"] > h3 > button`,
  findTarget: (h3) =>
    h3
      .closest("div[data-orientation='vertical']")!
      .querySelector("div[id^=radix]")!,
  extractCover: (_) => {
    const src = document
      .querySelector(".aspect-\\[2\\/3\\] > img.object-cover")
      ?.getAttribute("src")
    if (!src) return

    return new URL(src, location.href).searchParams.get("url")?.toString()
  },
  publisher: "novest.me",
  targetQueries: {
    bookTitle: "h1",
    chapters: ".grid > a",
    container: ($) => {
      const html = $(".relative").html()

      if (html) return html

      return "<i>Chương này cần đăng nhập hoặc mua</i>"
    }
  },
  title: (h3) => h3.querySelector("h3")!.textContent.trim(),
  description: () =>
    document
      .querySelector(".prose > .whitespace-pre-line")
      ?.textContent.trim() ?? "",
  getChapterTitle: (a) =>
    a.querySelector(".text-sm")?.textContent.trim() ?? "Unknown",
  lazyDom: true,
  fetcherOptions: {
    concurrency: 1,
    sleep: 5000
  }
})
