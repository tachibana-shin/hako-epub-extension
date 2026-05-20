import type { CheerioAPI } from "cheerio"
import type { FetcherOptions, PromiseOr } from "../registry"
import { load } from "cheerio"
import JSZip from "jszip"
import { del, get, set } from "idb-keyval"
import pLimit from "p-limit"
import { retryAsync } from "ts-retry"
import { cleanChapter } from "./clean-chapter"
import { sleep, getFetchUrl, getFetchCredentials } from "./utils"

export interface OptionsGenerateCbz {
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

// ComicInfo.xml metadata standard
function generateComicInfoXml(options: OptionsGenerateCbz): string {
  const escapeXml = (unsafe: string) => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case "<": return "&lt;"
        case ">": return "&gt;"
        case "&": return "&amp;"
        case "'": return "&apos;"
        case "\"": return "&quot;"
        default: return c
      }
    })
  }

  const title = escapeXml(options.title)
  const series = escapeXml(options.bookTitle)
  const writer = escapeXml(options.author.join(", "))
  const publisher = escapeXml(options.publisher)
  const summary = options.description ? escapeXml(options.description) : ""
  const genre = escapeXml(options.tags.join(", "))
  const number = options.chapterNumber.toString()

  return `<?xml version="1.0" encoding="utf-8"?>
<ComicInfo xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <Title>${title}</Title>
  <Series>${series}</Series>
  <Number>${number}</Number>
  <Writer>${writer}</Writer>
  <Publisher>${publisher}</Publisher>
  <Genre>${genre}</Genre>
  <Summary>${summary}</Summary>
  <LanguageISO>${options.lang || "vi"}</LanguageISO>
</ComicInfo>`
}

export async function generateCbz(
  options: OptionsGenerateCbz,
  onProgress: (progress: number) => void,
  qContainer: string | (($: CheerioAPI) => string | null),
  cleaner: ($: CheerioAPI) => void,
  transformContainer: ($: CheerioAPI) => CheerioAPI,
  fetcherOptions: FetcherOptions,
  preParse: (html: string) => PromiseOr<string>,
  fetchChapter: (chapter: { name: string; href: string }) => PromiseLike<Response>
): Promise<Uint8Array> {
  const {
    chapters,
    cover
  } = options

  const limit = pLimit(fetcherOptions.concurrency ?? 5)

  onProgress(0)

  const chapterContents = await Promise.all(
    chapters.map((chapter, index) =>
      limit(async () => {
        async function retry(idx: number) {
          const cached = await get(`cached_${chapter.href}`)
          if (cached) {
            const content = await cleanChapter(
              cached,
              qContainer,
              cleaner,
              transformContainer,
              preParse
            )
            if (content !== null) {
              onProgress((((index + 1) / chapters.length) * 40) / 100)
              return { title: chapter.name, content }
            }
            del(`cached_${chapter.href}`)
          }

          if (chapter.href.startsWith("javascript:")) {
            return { title: chapter.name, content: "" }
          }

          const response = await fetchChapter(chapter)
          if (response.status === 429 && idx < (fetcherOptions.retry ?? 10)) {
            await sleep(fetcherOptions.delayError429 ?? 60_000)
            return await retry(idx + 1)
          }

          if (!response.ok) {
            console.error(response)
            throw response.text()
          }

          const html = await response.text()
          await set(`cached_${chapter.href}`, html)

          const content = await cleanChapter(
            html,
            qContainer,
            cleaner,
            transformContainer,
            preParse
          )
          if (content === null) {
            console.warn(chapter)
            throw new Error(`Can't find content in chapter '${chapter.name}'`)
          }

          onProgress((((index + 1) / chapters.length) * 40) / 100)

          if (fetcherOptions.sleep) {
            await sleep(fetcherOptions.sleep)
          }

          return { title: chapter.name, content }
        }

        return await retry(0)
      })
    )
  )

  const imageUrls: { url: string; chapterIndex: number; pageIndex: number }[] = []
  chapterContents.forEach((chapter, chapterIndex) => {
    if (!chapter.content) return
    const $ = load(chapter.content, { xmlMode: true })
    $("img").each((pageIndex, img) => {
      let src = $(img).attr("src") || $(img).attr("data-src") || ""
      if (src) {
        if (src.endsWith("#cors")) {
          src = src.slice(0, -5)
        }
        imageUrls.push({
          url: src,
          chapterIndex,
          pageIndex
        })
      }
    })
  })

  const zip = new JSZip()
  const imageLimit = pLimit(fetcherOptions.concurrency ?? 5)
  const retryResource = fetcherOptions.retryResource ?? 3
  const fetchTimeoutResource = fetcherOptions.fetchTimeoutResource ?? 100
  zip.file("ComicInfo.xml", generateComicInfoXml(options))

  let coverBuffer: { data: ArrayBuffer; ext: string } | null = null
  if (cover) {
    coverBuffer = await retryAsync(
      () => {
        return fetch(getFetchUrl(cover), {
          credentials: getFetchCredentials(cover)
        }).then(async (res) => {
          if (!res.ok) throw new Error(`Failed to fetch cover: ${res.status}`)
          const mime = res.headers.get("content-type") || "image/jpeg"
          const ext = mime.split("/").at(-1) || "jpg"
          return {
            data: await res.arrayBuffer(),
            ext
          }
        })
      },
      { maxTry: retryResource, delay: fetchTimeoutResource }
    ).catch((err) => {
      console.error(`Error fetching cover: ${err}`)
      return null
    })
  }

  if (coverBuffer) {
    zip.file(`0000_cover.${coverBuffer.ext}`, coverBuffer.data)
  }

  let downloadedImagesCount = 0
  await Promise.all(
    imageUrls.map(({ url, chapterIndex, pageIndex }) =>
      imageLimit(async () => {
        const result = await retryAsync(
          async () => {
            const res = await fetch(getFetchUrl(url), {
              credentials: getFetchCredentials(url)
            })

            if (res.status === 404 || res.status === 403) {
              console.warn(`Skip image (HTTP ${res.status}): ${url}`)
              return null
            }

            if (res.status === 429) {
              await sleep(fetcherOptions.delayError429 ?? 60_000)
              throw new Error("Rate limited (429)")
            }

            if (!res.ok) {
              throw new Error(`Failed to fetch image: ${res.status}`)
            }

            const mime = res.headers.get("content-type") || "image/jpeg"
            const ext = mime.split("/").at(-1) || "jpg"
            return {
              data: await res.arrayBuffer(),
              ext
            }
          },
          {
            maxTry: retryResource,
            delay: fetchTimeoutResource,
            onError: (e) => {
              console.warn(`Warning (image ${url}): Download failed`, e)
              return false
            }
          }
        ).catch((err) => {
          console.warn(`Warning (image ${url}): Download failed`, err)
          return null
        })

        downloadedImagesCount++
        onProgress((40 + (downloadedImagesCount / (imageUrls.length || 1)) * 50) / 100)

        if (result) {
          const chStr = (chapterIndex + 1).toString().padStart(3, "0")
          const pgStr = (pageIndex + 1).toString().padStart(3, "0")
          zip.file(`ch${chStr}_pg${pgStr}.${result.ext}`, result.data)
        }
      })
    )
  )

  onProgress(0.95)
  const buffer = await zip.generateAsync({ type: "uint8array" })
  onProgress(1)
  return buffer
}
