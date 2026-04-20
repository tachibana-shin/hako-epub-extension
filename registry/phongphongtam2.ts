// eslint-disable-next-line ts/ban-ts-comment
// @ts-expect-error
import mintteanovel from "./mintteanovel.ts"

export default defineRegistry({
  domains: ["phongphongtam2.com"],
  lang: "vi",
  findAuthor: mintteanovel.findAuthor,
  findBlocks: ".post-title h1",
  findTarget: () => $("#manga-chapters-holder")!,
  extractCover: mintteanovel.extractCover,
  findTags: () =>
    contains("div", "post-content_item")
      ?.querySelector(".summary-content")
      ?.textContent.trim()
      ?.split(",")
      .map((s) => s.trim()) ?? [],
  title: () => $("h1")?.textContent.trim() ?? "Unknown",
  description: () => $(".manga-excerpt")?.textContent?.trim(),
  fetcherOptions: {
    delayError429: 15_000
  },
  publisher: "phongphongtam2.com",
  targetQueries: mintteanovel.targetQueries
})
