import { describe, expect, it, beforeAll } from "vitest"

import { $, $$ } from "./$$"

describe("$", () => {
  beforeAll(() => {
    document.body.innerHTML = `
      <ul id="list">
        <li class="item">Apple</li>
        <li class="item">Banana</li>
      </ul>
    `
  })

  it("returns first matching element", () => {
    const el = $(".item")
    expect(el).not.toBeNull()
    expect(el!.textContent).toBe("Apple")
  })

  it("returns null for no match", () => {
    const el = $(".nonexistent")
    expect(el).toBeNull()
  })

  it("searches within a scope element", () => {
    const list = document.getElementById("list")!
    const el = $(".item", list)
    expect(el?.textContent).toBe("Apple")
  })

  it("returns null when start is null", () => {
    const el = $(".item", null)
    expect(el).toBeNull()
  })
})

describe("$$", () => {
  beforeAll(() => {
    document.body.innerHTML = `
      <ul id="list">
        <li class="item">Apple</li>
        <li class="item">Banana</li>
      </ul>
    `
  })

  it("returns all matching elements", () => {
    const items = $$(".item")
    expect(items).toHaveLength(2)
  })

  it("returns empty NodeList for no match", () => {
    const items = $$(".nonexistent")
    expect(items).toHaveLength(0)
  })

  it("returns empty array when start is null", () => {
    const items = $$(".item", null)
    expect(items).toHaveLength(0)
  })
})
