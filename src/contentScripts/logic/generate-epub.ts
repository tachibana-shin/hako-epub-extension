import pLimit from "p-limit"
import { retryAsync } from "ts-retry"
import type { Content, Options } from "epub-gen-memory"
import { EPub } from "epub-gen-memory/bundle"
import { load } from "cheerio"
import { editFilesInEPUB } from "./edit-files-in-epub"
import { cleanChapter } from "./clean-chapter"
// eslint-disable-next-line ts/ban-ts-comment
// @ts-ignore
import UTMCandomebeTTF from "~/assets/fonts/UTM_Candombe.ttf?buffer&base64"
// eslint-disable-next-line ts/ban-ts-comment
// @ts-ignore
import UTMLinotypeZapfinoKTTTF from "~/assets/fonts/UTM_LinotypeZapfinoKT.ttf?buffer&base64"

class EPubExtend extends EPub {
  constructor(
    options: Options,
    content: Content,
    private readonly onProgress: (progress: number) => void
  ) {
    super(options, content)
  }

  override async downloadAllFonts() {
    if (!this.options.fonts.length) return this.log("No fonts to download")
    const oebps = this.zip.folder("OEBPS")!
    const fonts = oebps.folder("fonts")!

    for (
      let i = 0;
      i < this.options.fonts.length;
      i += this.options.batchSize
    ) {
      const fontContents = await Promise.all(
        this.options.fonts.slice(i, i + this.options.batchSize).map((font) => {
          const d = retryAsync(
            () =>
              fetch(font.url).then(async (res) =>
                res.ok
                  ? res.blob()
                  : Promise.reject(new Error("Failed to fetch font"))
              ),
            {
              maxTry: this.options.retryTimes,
              delay: this.options.fetchTimeout,
              onError: (e) => {
                console.log(e)
                return undefined
              }
            }
          ).then((res) => {
            this.log(`Downloaded font ${font.url}`)
            this.onProgress(
              (5 + ((i + 1) / (this.options.fonts.length || 1)) * 45) / 100
            )

            return { ...font, data: res }
          })
          return this.options.ignoreFailedDownloads
            ? d.catch((reason) => {
                this.warn(`Warning (font ${font.url}): Download failed`, reason)
                return { ...font, data: "" }
              })
            : d
        })
      )
      fontContents.forEach((font) =>
        fonts.file(font.filename, font.data as Blob)
      )
    }
  }

  override async downloadAllImages() {
    if (!this.images.length) return this.log("No images to download")
    const oebps = this.zip.folder("OEBPS")!
    const images = oebps.folder("images")!

    for (let i = 0; i < this.images.length; i += this.options.batchSize) {
      const imageContents = await Promise.all(
        this.images.slice(i, i + this.options.batchSize).map((image) => {
          const d = retryAsync(
            () =>
              fetch(image.url).then(async (res) =>
                res.ok
                  ? res.blob()
                  : Promise.reject(new Error("Failed to fetch image"))
              ),
            {
              maxTry: this.options.retryTimes,
              delay: this.options.fetchTimeout,
              onError: (e) => {
                console.log(e)
                return undefined
              }
            }
          ).then((res) => {
            this.log(`Downloaded image ${image.url}`)
            this.onProgress(
              (55 + ((i + 1) / (this.images.length || 1)) * 45) / 100
            )
            return { ...image, data: res }
          })
          return this.options.ignoreFailedDownloads
            ? d.catch((reason) => {
                this.warn(
                  `Warning (image ${image.url}): Download failed`,
                  reason
                )
                return { ...image, data: "" }
              })
            : d
        })
      )
      imageContents.forEach((image) =>
        images.file(`${image.id}.${image.extension}`, image.data)
      )
    }
  }

  override async render() {
    this.onProgress(0)
    this.log("Generating Template Files...")
    await this.generateTemplateFiles()
    this.onProgress(5 / 100)
    this.log("Downloading fonts...")
    await this.downloadAllFonts()
    this.log("Downloading images...")
    await this.downloadAllImages()
    this.log("Making cover...")
    await this.makeCover()
    this.onProgress(1)
    this.log("Finishing up...")
    return this
  }
}

export interface OptionsGenerateEpub {
  title: string
  bookTitle: string
  author: string[]
  tags: string[]
  publisher: string
  lang: string
  description?: string
  cover?: string
  chapterNumber: number
  chapters: {
    name: string
    href: string
  }[]
}

export async function generateEpub(
  options: OptionsGenerateEpub,
  onProgress: (progress: number) => void
): Promise<Uint8Array> {
  const {
    title,
    bookTitle,
    author,
    tags,
    publisher,
    lang,
    description,
    cover,
    chapterNumber,
    chapters
  } = options

  const limit = pLimit(5)

  const results: Content = await Promise.all(
    chapters.map((chapter, index) =>
      limit(() =>
        retryAsync(
          async () => {
            const response = await fetch(chapter.href)
            if (!response.ok) throw response.text()

            const html = await response.text()

            const content = await cleanChapter(html)

            onProgress((((index + 1) / chapters.length) * 50) / 100)

            return { title: chapter.name, content }
          },
          {
            maxTry: 5,
            delay: 1000,
            onError(err, currentTry) {
              console.error(
                `Error: ${err}. Sleep 1s and retry ${currentTry} of 5`
              )

              return undefined
            }
          }
        )
      )
    )
  )

  const buffer = await new EPubExtend(
    {
      title,
      author,
      publisher,
      description,
      tocTitle: "Mục lục",
      lang
    },
    results,
    (progress) => {
      onProgress(((progress + 1) * 50) / 100)
    }
  ).genEpub()

  const coverImg = await retryAsync(
    () =>
      fetch(`${cover}#cors`).then(async (res) =>
        res.ok
          ? {
              buffer: await res.arrayBuffer(),
              ext: res.headers.get("content-type")?.split("/").at(-1)
            }
          : Promise.reject(await res.text())
      ),
    { maxTry: 5 }
  ).catch((error) => {
    console.error(`Error fetching cover image: ${error}`)
    return undefined
  })

  const cBuffer = await editFilesInEPUB(await buffer.arrayBuffer(), {
    "OEBPS/content.opf": (content) => {
      const $ = load(content!, { xmlMode: true })
      $(`
<meta name="calibre:series" content="${bookTitle}"/>
<meta name="calibre:title_sort" content="${bookTitle} Tập ${chapterNumber}"/>
<meta name="calibre:series_index" content="${chapterNumber}"/>
${coverImg ? `<meta name="cover" content="cover.${coverImg.ext}"/>` : ""}
${tags.map((name) => `<dc:subject>${name}</dc:subject>`).join("\n")}
    `).appendTo($("metadata"))
      $(`
<item href="titlepage.xhtml" id="titlepage" media-type="application/xhtml+xml"/>
${coverImg ? `<item id="cover.${coverImg.ext}" href="cover.${coverImg.ext}" media-type="image/${coverImg.ext}" properties="cover-image"/>` : ""}
    `).prependTo($("manifest"))
      $('<itemref idref="titlepage">').prependTo($("spine"))
      $(`
<reference href="titlepage.xhtml" title="Cover" type="cover"/>
    `).appendTo($("guide"))

      return $.html()
    },
    ...(coverImg
      ? {
          "OEBPS/titlepage.xhtml": () => {
            return `<?xml version='1.0' encoding='utf-8'?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
        <meta name="calibre:cover" content="true"/>
        <title>Cover</title>
        <style type="text/css" title="override_css">
            @page {padding: 0pt; margin:0pt}
            body { text-align: center; padding:0pt; margin: 0pt; }
        </style>
    </head>
    <body>
        <div>
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="100%" height="100%" viewBox="0 0 473 751" preserveAspectRatio="none">
                <image width="473" height="751" xlink:href="cover.${coverImg.ext}"/>
            </svg>
        </div>
    </body>
</html>
`
          }
        }
      : undefined),
    ...(coverImg
      ? {
          [`OEBPS/cover.${coverImg.ext}`]: () => coverImg.buffer
        }
      : undefined),
    "OEBPS/fonts/UTM_Candombe.ttf": () => UTMCandomebeTTF,
    "OEBPS/fonts/UTM_LinotypeZapfinoKT.ttf": () => UTMLinotypeZapfinoKTTTF,
    "OEBPS/style.css": (css) => `${css}
/* @import url("https://fonts.googleapis.com/css2?family=Literata:ital,wght@0,400;0,700;1,400;1,700&display=swap");*/
/* Styles for Ebook */
body {
font-family: "Literata", serif;
line-height: 1.5;
}
p {
  margin: 0.2em 0;
  text-indent: 1.5em;
  text-align: justify;
}
div.tin {
margin: 1em 0 1em 0;
}
div.tin p {
 text-indent: 0;
 text-align: center;
 font-size: 92%;
}
.break {
  text-indent: 0;
  text-align: center;
  margin: 1.7em 0 1.7em 0;
}
.fp {margin-top: 2em;}
sup {
  font-size: 70%;
  line-height: 50%;
}
a {
  text-decoration: none;
  color: blue;
}
aside {
  padding: 0.2em;
}
h1 {
    font-family: "Song1", serif;
    text-align: center;
    font-size: 2.5rem;
    margin: 2em 0 2em 0;
}
h1 + p:first-letter {
  font-family: "Song";
  float: left;
  font-size: 220%;
  font-weight: normal;
  margin: -0.5em 0 -0.5em 0.5em;
  }
.center {
  text-align: center;
  text-indent: 0px;
}
h3 {
    font-family: "Song1", serif;
    text-align: center;
    font-size: 135%;
    margin: 3em 0 2em 0;
}
div.thu {
margin: 1.7em 0 1.7em 0;
}
div.thu p {
 font-size: 92%;
 text-indent: 0;
 margin-left: 3.3em;
}
h1 + p {
  text-indent: 0;
}
@font-face {
  font-family: "Song1";
  src: url(fonts/UTM_Candombe.ttf);
  font-weight: normal;
  font-style: normal;
}
@font-face {
  font-family: "Song";
  src: url(fonts/UTM_LinotypeZapfinoKT.ttf);
  font-weight: normal;
  font-style: normal;
}
`
  })

  return cBuffer
}
