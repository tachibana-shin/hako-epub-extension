// eslint-disable-next-line import/order
import { isBakaTsuki, isSonako } from "../vars"
import { load } from "cheerio"
import { minify } from "html-minifier-terser"

export async function cleanChapter(
  html: string,
  qContainer = "#chapter-content"
): Promise<string> {
  const $ = load(html, { xmlMode: true })

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

  // sonako
  if (isSonako) {
    // $("h3:has(.mw-editsection)").remove()

    $(".dotEPUBremove, .mw-editsection").remove()
    // sonako not need toc default
    $("#toc + h2, #toc, .mw-parser-output[lang] + h2").remove()

    $("h3:contains(Ghi chú):not(h3:has(+ .mw-references-wrap))").remove()
  }
  if (isBakaTsuki) {
    $(".wikitable, .mw-editsection, .printfooter").remove()
    $("#toc + h2, #toc, .mw-parser-output[lang] + h2").remove()
  }

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
