export function parse(urlStr: string) {
  try {
    return new URL(urlStr)
  } catch {
    return new URL(urlStr, "http://localhost")
  }
}
export function format(urlObj: any) {
  return urlObj.href || urlObj.toString()
}
export function resolve(from: string, to: string) {
  return new URL(to, from).href
}
export const URL = globalThis.URL
export const URLSearchParams = globalThis.URLSearchParams
export default { parse, format, resolve, URL, URLSearchParams }
