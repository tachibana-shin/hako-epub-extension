import { describe, expect, it, vi, afterEach } from "vitest"

// Mock browser.runtime.getURL
const mockGetURL = vi.fn((path: string) => `chrome-extension://abc/${path}`)

// Inline the index.ts logic for testing
function setupContentScript(name: string) {
  const script = document.createElement("script")
  document.documentElement.prepend(script)
  script.src = mockGetURL("dist/contentScripts/inject.global.js")

  const style = document.createElement("style")
  style.textContent = `.volume-list .sect-header { display: flex !important; }`
  document.documentElement.appendChild(style)

  const container = document.createElement("div")
  container.id = name
  const root = document.createElement("div")
  const styleEl = document.createElement("link")
  const shadowDOM = container.attachShadow?.({ mode: "closed" }) || container
  styleEl.setAttribute("rel", "stylesheet")
  styleEl.setAttribute("href", mockGetURL("dist/contentScripts/hako-epub.css"))
  shadowDOM.appendChild(styleEl)
  shadowDOM.appendChild(root)
  document.documentElement.appendChild(container)

  return { container, root, shadowDOM, script, style }
}

describe("content script injection", () => {
  afterEach(() => {
    document.head.innerHTML = ""
    document.body.innerHTML = ""
    // eslint-disable-next-line no-unused-expressions
    document.documentElement.innerHTML = ""
  })

  it("injects inject.global.js script at the start of html", () => {
    setupContentScript("hako-epub")

    const script = document.querySelector(
      'script[src="chrome-extension://abc/dist/contentScripts/inject.global.js"]'
    )
    expect(script).not.toBeNull()
    expect(document.documentElement.firstChild).toBe(script)
  })

  it("injects a style element for volume-list layout", () => {
    setupContentScript("hako-epub")

    const style = document.querySelector("style")
    expect(style).not.toBeNull()
    expect(style!.textContent).toContain("display: flex")
  })

  it("creates a shadow DOM container with the extension name as id", () => {
    const { container, shadowDOM } = setupContentScript("hako-epub")

    expect(container.id).toBe("hako-epub")
    expect(shadowDOM).not.toBe(container) // actual shadow DOM, not fallback
  })

  it("appends the container to document.documentElement", () => {
    const { container } = setupContentScript("hako-epub")

    expect(document.documentElement.lastChild).toBe(container)
  })

  it("adds a link stylesheet in shadow DOM for the extension CSS", () => {
    const { shadowDOM } = setupContentScript("hako-epub")

    const link = shadowDOM.querySelector("link")
    expect(link).not.toBeNull()
    expect(link!.getAttribute("rel")).toBe("stylesheet")
    expect(link!.getAttribute("href")).toBe(
      "chrome-extension://abc/dist/contentScripts/hako-epub.css"
    )
  })

  it("creates a mount root div inside shadow DOM", () => {
    const { shadowDOM, root } = setupContentScript("hako-epub")

    expect(shadowDOM.contains(root)).toBe(true)
  })

  it("works without attachShadow (fallback to container)", () => {
    const originalAttachShadow = Element.prototype.attachShadow
    Element.prototype.attachShadow = undefined as any

    try {
      const container = document.createElement("div")
      container.id = "test"
      const root = document.createElement("div")
      const styleEl = document.createElement("link")
      styleEl.setAttribute("rel", "stylesheet")
      styleEl.setAttribute("href", "test.css")

      // Fallback path: container itself is shadowDOM
      const shadowDOM = container.attachShadow?.({ mode: "closed" }) || container
      shadowDOM.appendChild(styleEl)
      shadowDOM.appendChild(root)

      expect(shadowDOM).toBe(container)
      expect(container.querySelector("link")).not.toBeNull()
    } finally {
      Element.prototype.attachShadow = originalAttachShadow
    }
  })
})
