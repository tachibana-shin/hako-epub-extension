import { load } from "cheerio"
import { minify } from "html-minifier-terser"

export async function cleanChapter(html: string): Promise<string> {
  const $ = load(html, { xmlMode: true })

  $(".d-none").remove()
  $("[style]").each((_, el) => {
    const $el = $(el)
    if ($el.attr("style")?.match(/display:\s*none/)) $el.remove()
  })
  $("#chapter-content > a[target='__blank']").remove()

  $("img").each((_, image) => {
    const $img = $(image)
    const src = $img.attr("data-src") ?? $img.attr("src")!

    $img.attr("src", src.endsWith("#cors") ? src : `${src}#cors`)
  })

  return minify($("#chapter-content").html()!, {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeEmptyAttributes: true,
    minifyCSS: true,
    minifyJS: true
  })
}
