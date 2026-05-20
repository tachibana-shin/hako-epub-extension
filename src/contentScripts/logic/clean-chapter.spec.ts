import { load } from "cheerio"
import { cleanChapter } from "./clean-chapter"

describe("cleanChapter", () => {
  const identity = ($: ReturnType<typeof load>) => $
  const noop = () => {}
  const passThrough = (html: string) => html

  it("cleans basic HTML by removing scripts and noscript", async () => {
    const html = `<div id="content"><script>alert(1)</script><noscript>no</noscript><p>Hello</p></div>`
    const result = await cleanChapter(html, "#content", noop, identity, passThrough)
    expect(result).not.toContain("<script>")
    expect(result).not.toContain("<noscript>")
    expect(result).toContain("Hello")
  })

  it("removes .d-none elements", async () => {
    const html = `<div id="content"><p class="d-none">hidden</p><p>visible</p></div>`
    const result = await cleanChapter(html, "#content", noop, identity, passThrough)
    expect(result).not.toContain("hidden")
    expect(result).toContain("visible")
  })

  it("returns null when container selector matches nothing", async () => {
    const html = `<div><p>Hello</p></div>`
    const result = await cleanChapter(html, "#nonexistent", noop, identity, passThrough)
    expect(result).toBeNull()
  })

  it("returns null when function container returns null", async () => {
    const html = `<div><p>Hello</p></div>`
    const result = await cleanChapter(html, () => null, noop, identity, passThrough)
    expect(result).toBeNull()
  })

  it("appends #cors to image src", async () => {
    const html = `<div id="content"><img src="https://example.com/img.jpg"/></div>`
    const result = await cleanChapter(html, "#content", noop, identity, passThrough)
    expect(result).toContain("#cors")
  })

  it("does not double-append #cors if already present", async () => {
    const html = `<div id="content"><img src="https://example.com/img.jpg#cors"/></div>`
    const result = await cleanChapter(html, "#content", noop, identity, passThrough)
    expect(result).toContain("img.jpg#cors")
    expect(result).not.toContain("#cors#cors")
  })

  it("unwraps <a> parent of <img>", async () => {
    const html = `<div id="content"><a href="#"><img src="img.jpg"/></a></div>`
    const result = await cleanChapter(html, "#content", noop, identity, passThrough)
    expect(result).toContain("<img")
    expect(result).not.toContain("<a")
  })

  it("uses data-src over src for images", async () => {
    const html = `<div id="content"><img data-src="real.jpg" src="placeholder.jpg"/></div>`
    const result = await cleanChapter(html, "#content", noop, identity, passThrough)
    expect(result).toContain("real.jpg#cors")
    expect(result).not.toContain("placeholder.jpg#cors")
  })

  it('removes elements with style "display: none"', async () => {
    const html = `<div id="content"><p style="display:none">hidden</p><p>visible</p></div>`
    const result = await cleanChapter(html, "#content", noop, identity, passThrough)
    expect(result).not.toContain("hidden")
    expect(result).toContain("visible")
  })

  it("processes notes: removes .none-print.inline and .note-content parent", async () => {
    const html = `<div id="content">
      <div id="note1">
        <span class="none-print inline">remove</span>
        <div class="note-content">content</div>
        text
      </div>
    </div>`
    const result = await cleanChapter(html, "#content", noop, identity, passThrough)
    expect(result).not.toContain("none-print")
    expect(result).not.toContain('class="note-content"')
  })

  it("converts [noteX] references to anchor links when note exists", async () => {
    const html = `<div id="content">
      text [note1] more
      <div id="note1">note text</div>
    </div>`
    const result = await cleanChapter(html, "#content", noop, identity, passThrough)
    expect(result).toContain('href="#note1"')
    expect(result).toContain('class="note-link"')
  })

  it("leaves [noteX] references untouched when note does not exist", async () => {
    const html = `<div id="content">text [note99] more</div>`
    const result = await cleanChapter(html, "#content", noop, identity, passThrough)
    expect(result).toContain("[note99]")
  })

  it("calls the cleaner callback", async () => {
    const html = `<div id="content"><p class="ads">ad</p><p>content</p></div>`
    const cleaner = ($: ReturnType<typeof load>) => {
      $(".ads").remove()
    }
    const result = await cleanChapter(html, "#content", cleaner, identity, passThrough)
    expect(result).not.toContain("ads")
    expect(result).toContain("content")
  })

  it("calls transformContainer", async () => {
    const html = `<div id="wrapper"><div id="content"><p>Hello</p></div></div>`
    const transform = ($: ReturnType<typeof load>) => {
      $("#wrapper").append('<div class="extra">extra</div>')
      return $
    }
    const result = await cleanChapter(html, "#content", noop, transform, passThrough)
    expect(result).toBeTruthy()
  })

  it("calls preParse", async () => {
    const html = `BEFORE<div id="content"><p>Hello</p></div>`
    const preParse = async (html: string) => {
      return html.replace("BEFORE", "")
    }
    const result = await cleanChapter(html, "#content", noop, identity, preParse)
    expect(result).toContain("Hello")
  })
})
