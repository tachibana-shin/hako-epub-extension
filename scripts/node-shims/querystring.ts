export function stringify(obj: Record<string, any>, sep?: string, eq?: string) {
  sep = sep || "&"
  eq = eq || "="
  return Object.entries(obj)
    .map(([k, v]) => `${encodeURIComponent(k)}${eq}${encodeURIComponent(String(v))}`)
    .join(sep)
}
export function parse(str: string, sep?: string, eq?: string) {
  sep = sep || "&"
  eq = eq || "="
  const result: Record<string, string> = {}
  str.split(sep).forEach((pair) => {
    const [k, v] = pair.split(eq)
    if (k) result[decodeURIComponent(k)] = decodeURIComponent(v || "")
  })
  return result
}
export function encode(str: string) {
  return encodeURIComponent(str)
}
export function decode(str: string) {
  return decodeURIComponent(str)
}
export const unescape = decode
export const escape = encode
export default { stringify, parse, encode, decode, unescape, escape }
