import { describe, expect, it, beforeAll } from "vitest"

import { $$ } from "./$$"
import { contains, containsAll } from "./contains"

describe("contains", () => {
  beforeAll(() => {
    document.body.innerHTML = `
      <ul id="list">
        <li class="item">Apple</li>
        <li class="item">Banana</li>
        <li class="item">Cherry</li>
      </ul>
    `
  })

  it("finds element by text content (case insensitive)", () => {
    const el = contains(".item", "banana")
    expect(el).not.toBeUndefined()
    expect(el?.textContent).toBe("Banana")
  })

  it("returns undefined when no match", () => {
    const el = contains(".item", "zebra")
    expect(el).toBeUndefined()
  })

  it("accepts ArrayLike as first argument", () => {
    const items = $$(".item")
    const el = contains(items, "cherry")
    expect(el?.textContent).toBe("Cherry")
  })
})

describe("containsAll", () => {
  beforeAll(() => {
    document.body.innerHTML = `
      <ul id="list">
        <li class="item">Apple</li>
        <li class="item">Banana</li>
        <li class="item">Cherry</li>
        <li class="item">date</li>
      </ul>
    `
  })

  it("finds all elements matching text", () => {
    const items = containsAll(".item", "a")
    expect(items.length).toBeGreaterThanOrEqual(3)
  })

  it("returns empty array when no match", () => {
    const items = containsAll(".item", "xyz")
    expect(items).toHaveLength(0)
  })

  it("accepts ArrayLike as first argument", () => {
    const items = $$(".item")
    const result = containsAll(items, "e")
    expect(result.length).toBeGreaterThanOrEqual(3)
  })
})
