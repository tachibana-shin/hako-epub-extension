import { describe, expect, it } from "vitest"

import { isForbiddenUrl } from "./env"

describe("isForbiddenUrl", () => {
  it("returns true for chrome-extension:// URLs", () => {
    expect(isForbiddenUrl("chrome-extension://abc123/popup.html")).toBe(true)
  })

  it("returns true for chrome-search:// URLs", () => {
    expect(isForbiddenUrl("chrome-search://local-ntp/local-ntp.html")).toBe(true)
  })

  it("returns true for chrome:// URLs", () => {
    expect(isForbiddenUrl("chrome://settings")).toBe(true)
  })

  it("returns true for devtools:// URLs", () => {
    expect(isForbiddenUrl("devtools://devtools/bundled/inspector.html")).toBe(true)
  })

  it("returns true for edge:// URLs", () => {
    expect(isForbiddenUrl("edge://settings")).toBe(true)
  })

  it("returns true for Chrome Web Store", () => {
    expect(isForbiddenUrl("https://chrome.google.com/webstore/detail/abc")).toBe(true)
  })

  it("returns false for normal http URLs", () => {
    expect(isForbiddenUrl("https://example.com/page")).toBe(false)
  })

  it("returns false for normal https URLs", () => {
    expect(isForbiddenUrl("https://hako.vn/truyen")).toBe(false)
  })

  it("returns false for http URLs", () => {
    expect(isForbiddenUrl("http://localhost:3303")).toBe(false)
  })
})
