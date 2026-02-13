import type { CheerioAPI } from "cheerio"
import { load } from "cheerio"
import { minify } from "html-minifier-terser"

export async function cleanChapter(
  html: string,
  qContainer: string,
  cleaner: ($: CheerioAPI) => void
): Promise<string | null> {
  const $ = load(html, { xmlMode: true })

  if ($(qContainer).length === 0) return null

  $(".d-none").remove()
  $('[id^="note"]').each((_, el) => {
    const $el = $(el)
    $el.find(".none-print.inline").remove()
    $el.find(".note-content").parent().remove()
  })
  $("script, noscript").remove()

  $("[style]").each((_, el) => {
    const $el = $(el)
    if ($el.attr("style")?.match(/display:\s*none/)) $el.remove()
  })
  $(`${qContainer} > a[target='__blank']`).remove()

  $("img").each((_, image) => {
    const $img = $(image)
    const src = $img.attr("data-src") ?? $img.attr("src")!

    $img.attr("src", src.endsWith("#cors") ? src : `${src}#cors`)
  })

  cleaner($)

  const output = await minify($(qContainer).html()!, {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeEmptyAttributes: true,
    minifyCSS: true,
    minifyJS: true
  })

  const notes = $('[id^="note"]')
    .toArray()
    .map((item) => $(item).attr("id")!)
  return output.replace(/\[(note\d+)\]/g, (match, noteId) => {
    if (!notes.includes(noteId)) return match
    // Process noteId here
    return `<a id="anchor-${noteId}" href="#${noteId}" class="note-link">**</a>`
  })
}
