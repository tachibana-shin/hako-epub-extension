import type { CheerioAPI } from "cheerio"

export type PromiseOr<T> = T | Promise<T>
export interface FetcherOptions {
  concurrency?: number
  delayError429?: number
  retry?: number
  // time sleep after download one chapter
  sleep?: number
}
export interface SiteConfig {
  domains: string[]
  lang: string | ((h3: HTMLElement) => string)
  /**
   * @description Accept return string format "Author 1 | Author 2 | ..."
   */
  findAuthor: (
    h3: HTMLElement,
    target: Element
  ) => string | string[] | undefined
  findBlocks: string
  findTarget: (h3: HTMLElement) => HTMLElement
  extractCover: (h3: HTMLElement, target: Element) => string | undefined
  findTags?: (h3: HTMLElement, target: Element) => string[]
  publisher: string
  targetQueries: {
    bookTitle: string
    chapters: string
    chaptersReverse?: boolean
    container: string | (($: CheerioAPI) => string | null)
  }
  title: (h3: HTMLElement, target: Element) => string
  description?: (h3: HTMLElement, target: Element) => string | undefined
  cleaner?: ($: CheerioAPI) => void
  transformContainer?: ($: CheerioAPI) => CheerioAPI
  preParse?: (html: string) => PromiseOr<string>
  getChapterTitle?: (anchor: HTMLElement) => string
  fetchChapter?: (chapter: { name: string, href: string }) => PromiseLike<Response>
  fetcherOptions?: FetcherOptions
  lazyDom?: boolean
}

export const defineRegistry = (config: SiteConfig) => config
