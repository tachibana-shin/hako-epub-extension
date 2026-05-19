export function get(url: string, opts?: any, cb?: any) {
  if (typeof opts === "function") {
    cb = opts
    opts = {}
  }
  fetch(url, opts)
    .then((r) => cb?.(r))
    .catch(() => {})
  return { on: () => {}, abort: () => {} }
}
export function request(url: string, opts?: any, cb?: any) {
  if (typeof opts === "function") {
    cb = opts
    opts = {}
  }
  const controller = new AbortController()
  fetch(url, { ...opts, signal: controller.signal })
    .then((r) => cb?.(r))
    .catch(() => {})
  return { on: () => {}, abort: () => controller.abort() }
}
export const Agent = class Agent {}
export default { get, request, Agent }
