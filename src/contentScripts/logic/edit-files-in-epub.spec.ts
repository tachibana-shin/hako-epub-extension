import { describe, expect, it, vi } from "vitest"

const mockFileContent = new Map<string, string>()

vi.mock("jszip", () => {
  const MockJSZip = {
    loadAsync: vi.fn(async () => ({
      file: vi.fn((path: string) => {
        if (mockFileContent.has(path)) {
          return { async: async () => mockFileContent.get(path) }
        }
        return null
      }),
      generateAsync: vi.fn(async ({ type }: { type: string }) => {
        if (type === "uint8array") return new Uint8Array([1, 2, 3])
        return ""
      })
    }))
  }
  return { default: MockJSZip }
})

import { editFilesInEPUB } from "./edit-files-in-epub"

describe("editFilesInEPUB", () => {
  beforeEach(() => {
    mockFileContent.clear()
  })

  it("edits existing files in the EPUB", async () => {
    mockFileContent.set("OEBPS/content.opf", "<xml>old</xml>")

    const result = await editFilesInEPUB(new ArrayBuffer(8), {
      "OEBPS/content.opf": (content) => content!.replace("old", "new")
    })

    expect(result).toBeInstanceOf(Uint8Array)
  })

  it("adds new files by editing undefined content", async () => {
    const result = await editFilesInEPUB(new ArrayBuffer(8), {
      "OEBPS/new-file.xhtml": () => "<html><body>new</body></html>"
    })

    expect(result).toBeInstanceOf(Uint8Array)
  })

  it("handles binary content via Uint8Array return", async () => {
    mockFileContent.set("OEBPS/image.png", "binary")

    const result = await editFilesInEPUB(new ArrayBuffer(8), {
      "OEBPS/image.png": () => new Uint8Array([10, 20, 30])
    })

    expect(result).toBeInstanceOf(Uint8Array)
  })
})
