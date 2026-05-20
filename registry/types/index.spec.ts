import { describe, expect, it } from "vitest"

import { defineRegistry } from "./index"

describe("defineRegistry", () => {
  it("returns the same config object", () => {
    const config = {
      domains: ["example.com"],
      lang: "en",
      findAuthor: () => "Author",
      findBlocks: ".chapter",
      findTarget: () => document.createElement("div"),
      extractCover: () => undefined,
      publisher: "Test",
      targetQueries: {
        bookTitle: "h1",
        chapters: "a",
        container: "#content"
      },
      title: () => "Title"
    }
    const result = defineRegistry(config)
    expect(result).toBe(config)
    expect(result.domains).toEqual(["example.com"])
    expect(result.publisher).toBe("Test")
  })
})
