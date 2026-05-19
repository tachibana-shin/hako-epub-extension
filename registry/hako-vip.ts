/* eslint-disable prefer-promise-reject-errors */

const storeVolumeList = new Map<string, Promise<Volume[]>>()

export default defineRegistry({
  domains: ["hako.vip"],
  lang: "vi",
  customStyle: `.volume-title { margin-right: auto }`,
  findAuthor() {
    return document.querySelector(".book-header-meta > span:first-child")?.textContent.trim()
  },
  findBlocks: ".volume-header",
  findTarget(h3: HTMLElement): HTMLElement {
    return h3
  },
  extractCover() {
    return document.querySelector(".book-header-mobile img")?.getAttribute("src") ?? void 0
  },
  findTags: () =>
    Array.from(document.querySelectorAll(".tag-chip-readonly")).map(
      (el) => el.textContent?.trim() ?? ""
    ),
  publisher: "hako.vip",
  targetQueries: {
    bookTitle: "h1",
    chapters: "li.chapter-item",
    container: "#content"
  },
  title(h3: HTMLElement): string {
    const titleEl = Array.from(h3.querySelector(".volume-title")!.childNodes)
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((t) => t.textContent)
      .join("")

    return titleEl.trim() ?? "Unknown"
  },
  description: () => document.querySelector(".text-sm.text-secondary")?.textContent?.trim(),
  lazyDom: true,
  async getChaptersList(h3) {
    const bookUuid = location.pathname.split("/book")[1].trim().split("/")[1]

    let listPromise = storeVolumeList.get(bookUuid)
    if (listPromise === void 0) {
      listPromise = getAllVolumesByBook(
        localStorage.activeProfile === "sync" ? "TuLamDB_sync" : "TuLamDB",
        bookUuid
      )
      storeVolumeList.set(bookUuid, listPromise)
    }

    const all = await listPromise
    const volName = Array.from(h3.querySelector(".volume-title")!.childNodes)
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((t) => t.textContent)
      .join("")
      .trim()
    const currentVolume = all.find((vol) => vol.title === volName)

    if (currentVolume === void 0) throw new Error("Can't find volume in storage")

    const chapters = await getChaptersByVolume(
      localStorage.activeProfile === "sync" ? "TuLamDB_sync" : "TuLamDB",
      currentVolume.id
    )

    return chapters
      .sort((a, b) => a.order - b.order)
      .map((chp) => {
        const formattedContent = chp.translatedText
          .trim()
          .replace(/Discord\s+Facebook\s+(?:-+>)?/, "")
          .split(/\n{2,}/g)
          .map((paragraph) => `<p>${paragraph.trim().replace(/\n/g, "<br>")}</p>`)
          .join("")
          .trim()

        const content = formattedContent
          .replace(/\[img\]https:\/\/i.hako.vn\/ln\/series\/chapter-banners\/[^[]+\[\/img\]/g, "")
          .replace(/\[IMG:([^\]]+)\]|\[img\](.*?)\[\/img\]/gi, (_, idGroup, urlGroup) => {
            let src = ""

            if (idGroup) {
              src = chp.images?.find((img) => img.id === idGroup)?.dataUrl || ""
            } else if (urlGroup) {
              src = urlGroup.trim()
            }

            if (!src) return `<span>Image not found</span>`

            return `<img src="${src}" alt="${chp.title}" style="max-width: 100%; display: block; margin: 10px auto;" />`
          })

        return { name: chp.title, href: content }
      })
  },
  async fetchChapter(chapter) {
    return new Response(`<div id=content>${chapter.href}</div>`, {
      status: 200
    })
  }
})

interface Volume {
  id: string
  bookId: string
  driveFileId: string
  title: string
  order: number
}

function openDB(dbName: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(`Can't open database: ${dbName}`)
  })
}

async function getAllVolumesByBook(dbName: string, bookUuid: string): Promise<Volume[]> {
  const db = await openDB(dbName)

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(["volumes"], "readonly")
      const store = transaction.objectStore("volumes")
      const index = store.index("bookId")

      const request = index.getAll(bookUuid)

      request.onsuccess = () => {
        resolve(request.result as Volume[])
        db.close()
      }

      request.onerror = () => reject("Can't query volumes")
    } catch (error) {
      reject(error)
      db.close()
    }
  })
}

interface Chapter {
  id: string
  bookId: string
  volumeId: string
  driveFileId: string
  title: string
  order: number
  images?: {
    id: string
    dataUrl: string
    name: string
  }[]
  translatedText: string
  sourceId?: string // version 5
}

async function getChaptersByVolume(dbName: string, volumeId: string): Promise<Chapter[]> {
  const db = await openDB(dbName)

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(["chapters"], "readonly")
      const store = transaction.objectStore("chapters")
      const index = store.index("volumeId")

      const request = index.getAll(volumeId)

      request.onsuccess = () => {
        const chapters = (request.result as Chapter[]).sort((a, b) => a.order - b.order)
        resolve(chapters)
        db.close()
      }

      request.onerror = () => reject(`Can't get chapters for volume: ${volumeId}`)
    } catch (error) {
      reject(error)
      db.close()
    }
  })
}
