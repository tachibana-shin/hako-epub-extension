import type { CheerioAPI } from "cheerio"
import type { PromiseOr } from "registry/types"
import { load } from "cheerio"
import { minify } from "html-minifier-terser"

export async function cleanChapter(
  html: string,
  qContainer: string | (($: CheerioAPI) => string | null),
  cleaner: ($: CheerioAPI) => void,
  transformContainer: ($: CheerioAPI) => CheerioAPI,
  preParse: (html: string) => PromiseOr<string>
): Promise<string | null> {
  const $ = transformContainer(
    load(await preParse(html), {
      xml: { xmlMode: true, selfClosingTags: false }
    })
  )

  if (typeof qContainer === "function") {
    const html = qContainer($)
    if (html === null || html.length === 0) return null
  } else {
    if ($(qContainer).length === 0) return null
  }

  $(".d-none").remove()
  $('[id^="note"]').each((_, el) => {
    const $el = $(el)
    $el.find(".none-print.inline").remove()
    $el.find(".note-content").parent().remove()
  })
  $("script, noscript").remove()

  if (typeof qContainer !== "function") {
    $(`${qContainer} > a[target='__blank']`).remove()
  }

  $("img").each((_, image) => {
    const $img = $(image)
    const src = $img.attr("data-src") ?? $img.attr("src")!

    if ($img.parent().is("a")) {
      $img.parent().replaceWith($img)
    }

    $img.attr("src", src.endsWith("#cors") ? src : `${src}#cors`)
  })

  cleaner($)

  $("[style]").each((_, el) => {
    const $el = $(el)
    if ($el.attr("style")?.match(/display:\s*none/)) $el.remove()
  })

  const rawHtml = typeof qContainer === "function" ? qContainer($) : $(qContainer).html()
  if (!rawHtml) return null

  const output = await minify(rawHtml, {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeEmptyAttributes: true,
    minifyCSS: true,
    minifyJS: true,
    continueOnParseError: true
  })
    // fix XHTML not parse &nbsp;
    .then((html) => html.replaceAll("&amp;", "&"))
    .then((html) => html.replaceAll("&nbsp;", "\u00A0"))

  const notes = $('[id^="note"]')
    .toArray()
    .map((item) => $(item).attr("id")!)
  return output.replace(/\[(note\d+)\]/g, (match, noteId) => {
    if (!notes.includes(noteId)) return match
    // Process noteId here
    return `<a id="anchor-${noteId}" href="#${noteId}" class="note-link">**</a>`
  })
}
