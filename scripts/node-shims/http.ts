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
export const STATUS_CODES: Record<number, string> = {
  200: "OK",
  201: "Created",
  204: "No Content",
  301: "Moved Permanently",
  302: "Found",
  304: "Not Modified",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  500: "Internal Server Error",
  502: "Bad Gateway",
  503: "Service Unavailable"
}
export default { get, request, Agent, STATUS_CODES }
