<script lang="ts" setup>
import saveAs from "file-saver"
import { delMany, get, getMany, setMany } from "idb-keyval"
import type { CheerioAPI } from "cheerio"
import { generateEpub } from "../logic/generate-epub"
import { toastShadow } from "./toast-shadow"
import XRadialProgress from "./XRadialProgress.ce.vue"

const {
  target,
  title: propTitle,
  cover: propCover,
  author: propAuthor,
  qBookTitle = ".series-name",
  qChapters = "ul.list-chapters li > .chapter-name > a",
  qContainer = "#chapter-content",

  cleaner: propCleaner = (_) => {},

  publisher = "hako.vn",
  lang = "vi"
} = defineProps<{
  target: string
  title?: string
  cover?: string
  author?: string
  qBookTitle?: string
  qChapters?: string
  qContainer?: string

  cleaner?: ($: CheerioAPI) => void

  publisher?: string
  lang?: string
}>()
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

  return (
    slug +
    (propTitle ?? targetEl.querySelector(".sect-title")!.textContent.trim())
  )
})

const downloadProgress = ref(-1)
const downloadDone = ref(false)

watchEffect(() => {
  get(slug.value).then((exists) => {
    if (exists) downloadDone.value = true
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

  const title =
    propTitle ?? targetEl.querySelector(".sect-title")!.textContent.trim()
  const bookTitle = document.querySelector(qBookTitle)!.textContent.trim()
  const infoItems = Array.from(document.querySelectorAll(".info-item"))

  const author =
    propAuthor?.split("|") ??
    Array.from(
      infoItems
        .find((info) =>
          info.querySelector(".info-name")?.textContent.includes("Tác giả:")
        )
        ?.querySelector(".info-value")
        ?.querySelectorAll("a, span") ?? []
    ).map((el) => el.textContent.trim())
  const tags = [
    bookTitle,
    ...Array.from(document.querySelectorAll(".series-gerne-item"))
      .map((a) =>
        a
          .textContent!.trim()
          .split(";")
          .map((item) => item.trim())
      )
      .flat(1)
      .filter(Boolean)
  ]
  const description = document
    .querySelector(".summary-content")
    ?.textContent?.trim()
  let cover =
    propCover ??
    targetEl
      .querySelector(".volume-cover .content")
      ?.getAttribute("style")
      ?.match(/url\(["'](.+)["']\)/)![1]
  if (!cover || cover.includes("nocover.jpg")) {
    cover = document
      .querySelector(".series-cover .content")
      ?.getAttribute("style")
      ?.match(/url\(["'](.+)["']\)/)![1]
  }
  const chapterNumber =
    Number.parseFloat(title.replace(/^tập|chapter|chap/i, "")) ||
    Array.from(targetEl.parentNode!.querySelectorAll(".volume-list")).indexOf(
      targetEl
    ) + 1

  const chapters = Array.from(targetEl.querySelectorAll(qChapters)).map(
    (anchor) => {
      return {
        name: anchor.textContent.trim(),
        href: anchor.getAttribute("href")!
      }
    }
  )

  const options = {
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
  }
  const { buffer } = await generateEpub(
    options,
    (progress) => {
      console.log(`Generating EPUB: ${progress * 100}%`)
      downloadProgress.value = progress
    },
    qContainer,
    propCleaner
  ).catch((err) => {
    console.error(err)
    toastShadow(`Error generating EPUB ${err}`, { type: "error" })

    throw err
  })

  downloadDone.value = true
  downloadProgress.value = -1

  setMany([
    [slug.value, JSON.stringify(options)],
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
    toastShadow("File not found retry download", { type: "error" })
  }
}

function confirmDelete() {
  // eslint-disable-next-line no-alert
  if (!confirm(`Are you sure delete cache this?`)) return

  const chapters = Array.from(targetEl.querySelectorAll(qChapters)).map(
    (anchor) => anchor.getAttribute("href")!
  )

  delMany([
    slug.value,
    `${slug.value}_file`,

    ...chapters.map((chapter) => `cached_${chapter}`)
  ])

  downloadDone.value = false
}
</script>

<template>
  <button
    v-if="downloadProgress === -1"
    class="btn ml-2 my--2 pa-2 bg-#222 bg-opacity-20 rounded-50% transition-ease-in-out duration-222ms transition-all hover:bg-opacity-30"
    @click.prevent.stop="!downloadDone ? downloadVolume() : downloadD()"
    @contextmenu.prevent.stop="confirmDelete"
  >
    <i-hugeicons-apple-finder v-if="downloadDone" />
    <i-hugeicons-download-04 v-else />
  </button>
  <XRadialProgress
    v-else-if="!downloadDone"
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
