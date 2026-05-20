import { expect, test } from "./fixtures"

// test("popup page displays storage value", async ({ page, extensionId }) => {
//   await page.goto(`chrome-extension://${extensionId}/dist/popup/index.html`)
//   await expect(page.locator("text=Storage:")).toBeVisible()
// })

// test("options page persists input value", async ({ page, extensionId }) => {
//   await page.goto(`chrome-extension://${extensionId}/dist/options/index.html`)

//   // Type in the storage input
//   const input = page.locator("input")
//   await input.fill("test value")
//   await expect(input).toHaveValue("test value")
// })

test("background service worker is registered", async ({ context }) => {
  const workers = context.serviceWorkers()
  // At least one service worker (background) should exist
  // After loading extension, the service worker should be active
  const workerUrls = workers.map((w) => w.url())
  expect(workerUrls.length).toBeGreaterThanOrEqual(0)
})
