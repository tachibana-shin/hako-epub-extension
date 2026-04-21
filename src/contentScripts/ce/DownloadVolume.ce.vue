<script lang="ts" setup>
import saveAs from "file-saver"
import { delMany, getMany, setMany } from "idb-keyval"
import type { SiteConfig } from "../registry"
import { generateEpub } from "../logic/generate-epub"
import { toastShadow } from "./toast-shadow"
import XRadialProgress from "./XRadialProgress.ce.vue"

const { target, config, source } = defineProps<{
  target: string
  config: SiteConfig
  source: HTMLElement
}>()
const {
  lang,
  targetQueries: {
    bookTitle: qBookTitle = ".series-name",
    chapters: qChapters = "ul.list-chapters li > .chapter-name > a",
    chaptersReverse = false,
    container: qContainer = "#chapter-content"
  } = {},
  cleaner: propCleaner = (_) => {},
  transformContainer: propTransformContainer = ($) => $,
  preParse: propPreParse = (html: string) => {
    const wrap = document.createElement("div")
    wrap.innerHTML = html

    return wrap.innerHTML
  },
  fetchChapter: propFetchChapter = (chapter: { name: string, href: string }) => fetch(chapter.href),
  getChapterTitle = (anchor: HTMLElement) => anchor.textContent!.trim(),
  fetcherOptions: propFetcherOptions = {},

  publisher,
  title: configTitle,
  description: configDescription,
  extractCover: configExtractCover,
  findAuthor: configFindAuthor,
  findTags: configFindTags
} = config

const targetEl = document.querySelector(`[v-id="${target}"]`)!
if (!targetEl) throw new Error(`Target v-id='${target}' not found`)

const slug = computed(() => {
  const slug = (
    document.querySelector("link[rel=canonical]")?.getAttribute("href") ??
    location.pathname
  )
    .split("/")
    .filter(Boolean)
    .at(-1)!

  return slug + configTitle(source, targetEl)
})
function getChapters() {
  const chapters = Array.from(
    targetEl.querySelectorAll<HTMLElement>(qChapters)
  ).map((anchor) => {
    return {
      name: getChapterTitle(anchor),
      href: anchor.getAttribute("href")!
    }
  })
  if (chapters.length === 0) return chapters

  const numFirst = Number.parseInt(chapters[0].name.replace(/\D/g, ""))
  const numLast = Number.parseInt(
    chapters[chapters.length - 1].name.replace(/\D/g, "")
  )

  if (chaptersReverse) {
    if (Number.isNaN(numFirst) || Number.isNaN(numLast)) {
      chapters.reverse()
    } else {
      if (numFirst > numLast) chapters.reverse()
    }
  }

  return chapters
}

const chaptersHash = ref("")
watch(
  () => getChapters(),
  async (newChapters) => {
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(JSON.stringify(newChapters))
    )
    chaptersHash.value = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  },
  { immediate: true }
)

enum DownloadState {
  Done,
  Update,
  None
}

const downloadProgress = ref(-1)
const downloadDone = ref<DownloadState>(DownloadState.None)

watchEffect(() => {
  getMany([slug.value, `${slug.value}_hash`]).then(([metadata, hash]) => {
    if (metadata) {
      downloadDone.value =
        hash === chaptersHash.value ? DownloadState.Done : DownloadState.Update
    }
  })
})

const blocking = ref(0)
function onBeforeUnload(event: BeforeUnloadEvent) {
  event.preventDefault()
}
let hasListenBeforeUnload = false
watchEffect(() => {
  if (blocking.value > 0) {
    if (!hasListenBeforeUnload) {
      window.addEventListener("beforeunload", onBeforeUnload)
      hasListenBeforeUnload = true
    }
  } else {
    if (hasListenBeforeUnload) {
      window.removeEventListener("beforeunload", onBeforeUnload)
      hasListenBeforeUnload = false
    }
  }
})

async function downloadVolume() {
  blocking.value++
  console.log("download volume")

  console.log({ source })

  const title = configTitle(source, targetEl)
  const bookTitle =
    document.querySelector(qBookTitle)?.textContent?.trim() ?? "Unknown"

  const authorStr = configFindAuthor(source, targetEl)
  const author =
    typeof authorStr === "string"
      ? authorStr.split("|").map((item) => item.trim())
      : (authorStr ?? [])

  const tags = [bookTitle, ...(configFindTags?.(source, targetEl) ?? [])]
  const description = configDescription?.(source, targetEl)
  const cover = configExtractCover(source, targetEl)
  // TODO: clean me this logic for pages vietnamese
  const chapterNumber =
    Number.parseFloat(title.replace(/^tập|chapter|chap/i, "")) ||
    Array.from(targetEl.parentNode!.querySelectorAll(".volume-list")).indexOf(
      targetEl
    ) + 1

  const options = {
    title,
    bookTitle,
    author,
    tags,
    publisher,
    lang: typeof lang === "function" ? lang(source) : lang,
    description,
    cover,
    chapterNumber,
    chapters: getChapters()
  }
  const { buffer } = await generateEpub(
    options,
    (progress) => {
      console.log(`Generating EPUB: ${progress * 100}%`)
      downloadProgress.value = progress
    },
    qContainer,
    propCleaner,
    propTransformContainer,
    propFetcherOptions,
    propPreParse,
    propFetchChapter
  ).catch((err) => {
    console.error(err)
    toastShadow(`Error generating EPUB ${err}`, "error")

    throw err
  })

  downloadDone.value = DownloadState.Done
  downloadProgress.value = -1

  setMany([
    [slug.value, JSON.stringify(options)],
    [`${slug.value}_hash`, chaptersHash.value],
    [`${slug.value}_file`, buffer]
  ])

  const blob = new Blob([buffer as ArrayBuffer])

  saveAs(blob, `${options.title} - ${options.bookTitle}.epub`)
  blocking.value--
}
async function downloadD() {
  const [metadata, buffer] = await getMany([slug.value, `${slug.value}_file`])

  if (metadata && buffer) {
    const options = JSON.parse(metadata)
    const blob = new Blob([buffer as ArrayBuffer])
    saveAs(blob, `${options.title} - ${options.bookTitle}.epub`)
  } else {
    delMany([slug.value, `${slug.value}_file`])
    toastShadow("File not found retry download", "error")
  }
}

function confirmDelete() {
  // eslint-disable-next-line no-alert
  if (!confirm(`Are you sure delete cache this?`)) return

  delMany([
    slug.value,
    `${slug.value}_hash`,
    `${slug.value}_file`,

    ...getChapters().map((chapter) => `cached_${chapter.href}`)
  ])

  downloadDone.value = DownloadState.None
}
</script>

<template>
  <button
    v-if="downloadProgress === -1"
    class="btn ml-2 my--2 pa-2 bg-#222 bg-opacity-20 rounded-50% transition-ease-in-out duration-222ms transition-all hover:bg-opacity-30"
    @click.prevent.stop="
      downloadDone !== DownloadState.Done ? downloadVolume() : downloadD()
    "
    @contextmenu.prevent.stop="confirmDelete"
  >
    <i-hugeicons-apple-finder v-if="downloadDone === DownloadState.Done" />
    <i-hugeicons-system-update-02
      v-else-if="downloadDone === DownloadState.Update"
    />
    <i-hugeicons-download-04 v-else />
  </button>
  <XRadialProgress
    v-else-if="downloadDone !== DownloadState.Done"
    class="text-12px my--2"
    :value="Math.round(downloadProgress * 100)"
    :size="30"
  />
</template>

<style lang="scss" scoped>
.btn {
  @media only screen and (min-width: 999.01px) {
    margin: {
      top: 0px !important;
      bottom: 0px !important;
    }
  }
}
</style>
