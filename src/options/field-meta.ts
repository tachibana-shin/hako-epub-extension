export type FieldType = "string" | "number" | "boolean" | "string[]" | "function" | "object" | "string|function"

export interface FieldMeta {
  labelKey: string
  descKey?: string
  group: string
  type: FieldType
}

export const fieldLabels: Record<string, FieldMeta> = {
  domains:           { labelKey: "fieldDomains",           descKey: "fieldDomainsDesc",           group: "basic",     type: "string[]" },
  lang:              { labelKey: "fieldLang",              descKey: "fieldLangDesc",              group: "basic",     type: "string|function" },
  publisher:         { labelKey: "fieldPublisher",         descKey: "fieldPublisherDesc",         group: "basic",     type: "string" },
  customStyle:       { labelKey: "fieldCustomStyle",       descKey: "fieldCustomStyleDesc",       group: "basic",     type: "string" },
  lazyDom:           { labelKey: "fieldLazyDom",           descKey: "fieldLazyDomDesc",           group: "basic",     type: "boolean" },
  findBlocks:        { labelKey: "fieldFindBlocks",        descKey: "fieldFindBlocksDesc",        group: "selectors", type: "string" },
  findTarget:        { labelKey: "fieldFindTarget",        descKey: "fieldFindTargetDesc",        group: "functions", type: "function" },
  findAuthor:        { labelKey: "fieldFindAuthor",        descKey: "fieldFindAuthorDesc",        group: "functions", type: "function" },
  extractCover:      { labelKey: "fieldExtractCover",      descKey: "fieldExtractCoverDesc",      group: "functions", type: "function" },
  findTags:          { labelKey: "fieldFindTags",          descKey: "fieldFindTagsDesc",          group: "functions", type: "function" },
  title:             { labelKey: "fieldTitle",             descKey: "fieldTitleDesc",             group: "functions", type: "function" },
  description:       { labelKey: "fieldDescription",       descKey: "fieldDescriptionDesc",       group: "functions", type: "function" },
  cleaner:           { labelKey: "fieldCleaner",           descKey: "fieldCleanerDesc",           group: "functions", type: "function" },
  transformContainer:{ labelKey: "fieldTransformContainer",descKey: "fieldTransformContainerDesc",group: "functions", type: "function" },
  preParse:          { labelKey: "fieldPreParse",          descKey: "fieldPreParseDesc",          group: "functions", type: "function" },
  getChaptersList:   { labelKey: "fieldGetChaptersList",   descKey: "fieldGetChaptersListDesc",   group: "functions", type: "function" },
  getChapterTitle:   { labelKey: "fieldGetChapterTitle",   descKey: "fieldGetChapterTitleDesc",   group: "functions", type: "function" },
  getChapterHref:    { labelKey: "fieldGetChapterHref",    descKey: "fieldGetChapterHrefDesc",    group: "functions", type: "function" },
  fetchChapter:      { labelKey: "fieldFetchChapter",      descKey: "fieldFetchChapterDesc",      group: "functions", type: "function" },
  targetQueries:     { labelKey: "fieldTargetQueries",     descKey: "fieldTargetQueriesDesc",     group: "object",    type: "object" },
  fetcherOptions:    { labelKey: "fieldFetcherOptions",    descKey: "fieldFetcherOptionsDesc",    group: "object",    type: "object" },
}

export const subFieldLabels: Record<string, FieldMeta> = {
  "targetQueries.bookTitle":      { labelKey: "fieldTargetQueriesBookTitle",     descKey: "fieldTargetQueriesBookTitleDesc",     group: "object", type: "string" },
  "targetQueries.chapters":       { labelKey: "fieldTargetQueriesChapters",       descKey: "fieldTargetQueriesChaptersDesc",     group: "object", type: "string" },
  "targetQueries.chaptersReverse":{ labelKey: "fieldTargetQueriesChaptersReverse",descKey: "fieldTargetQueriesChaptersReverseDesc", group: "object", type: "boolean" },
  "targetQueries.container":      { labelKey: "fieldTargetQueriesContainer",     descKey: "fieldTargetQueriesContainerDesc",    group: "object", type: "string|function" },
  "fetcherOptions.concurrency":       { labelKey: "fieldFetcherOptionsConcurrency",       descKey: "fieldFetcherOptionsConcurrencyDesc",       group: "object", type: "number" },
  "fetcherOptions.delayError429":     { labelKey: "fieldFetcherOptionsDelayError429",     descKey: "fieldFetcherOptionsDelayError429Desc",     group: "object", type: "number" },
  "fetcherOptions.retry":             { labelKey: "fieldFetcherOptionsRetry",             descKey: "fieldFetcherOptionsRetryDesc",             group: "object", type: "number" },
  "fetcherOptions.retryResource":     { labelKey: "fieldFetcherOptionsRetryResource",     descKey: "fieldFetcherOptionsRetryResourceDesc",     group: "object", type: "number" },
  "fetcherOptions.fetchTimeout":      { labelKey: "fieldFetcherOptionsFetchTimeout",      descKey: "fieldFetcherOptionsFetchTimeoutDesc",     group: "object", type: "number" },
  "fetcherOptions.fetchTimeoutResource": { labelKey: "fieldFetcherOptionsFetchTimeoutResource",descKey: "fieldFetcherOptionsFetchTimeoutResourceDesc",group: "object", type: "number" },
  "fetcherOptions.sleep":             { labelKey: "fieldFetcherOptionsSleep",             descKey: "fieldFetcherOptionsSleepDesc",             group: "object", type: "number" },
}

export const groupOrder = ["basic", "selectors", "object", "functions", "fetcher"] as const

export function getFieldType(value: unknown): FieldType {
  if (value === null || value === undefined) return "string"
  if (Array.isArray(value)) return "string[]"
  if (typeof value === "function") return "function"
  if (typeof value === "object") return "object"
  if (typeof value === "boolean") return "boolean"
  if (typeof value === "number") return "number"
  return "string"
}

export function resolveFieldType(key: string, parentKey: string | undefined, value: unknown): FieldType {
  const fullKey = parentKey ? `${parentKey}.${key}` : key
  const sub = subFieldLabels[fullKey]
  if (sub) return sub.type
  const meta = fieldLabels[key]
  if (meta) return meta.type
  return getFieldType(value)
}
