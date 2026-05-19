export function basename(p: string, ext?: string) {
  const base = p.split("/").pop() || p
  if (ext && base.endsWith(ext)) return base.slice(0, -ext.length)
  return base
}
export function dirname(p: string) {
  const parts = p.split("/")
  parts.pop()
  return parts.join("/") || "/"
}
export function extname(p: string) {
  const base = p.split("/").pop() || p
  const i = base.lastIndexOf(".")
  return i >= 0 ? base.slice(i) : ""
}
export function resolve(...segments: string[]) {
  return segments.join("/").replace(/\/+/g, "/")
}
export function join(...segments: string[]) {
  return segments.filter(Boolean).join("/").replace(/\/+/g, "/")
}
export function isAbsolute(p: string) {
  return p.startsWith("/")
}
export function relative(from: string, to: string) {
  const f = from.split("/").filter(Boolean)
  const t = to.split("/").filter(Boolean)
  while (f.length && t.length && f[0] === t[0]) {
    f.shift()
    t.shift()
  }
  return (
    f
      .map(() => "..")
      .concat(t)
      .join("/") || "."
  )
}
export function normalize(p: string) {
  return p.replace(/\/+/g, "/").replace(/\/$/, "")
}
export const sep = "/"
export const delimiter = ":"
export const posix = {
  basename,
  dirname,
  extname,
  resolve,
  join,
  isAbsolute,
  relative,
  normalize,
  sep,
  delimiter
}
export default {
  basename,
  dirname,
  extname,
  resolve,
  join,
  isAbsolute,
  relative,
  normalize,
  sep,
  delimiter,
  posix
}
