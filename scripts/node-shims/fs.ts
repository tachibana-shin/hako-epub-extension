export const existsSync = () => false
export function readFileSync() {
  throw new Error("fs.readFileSync not available in browser")
}
export function readFile() {
  return Promise.reject(new Error("fs.readFile not available in browser"))
}
export function writeFileSync() {
  throw new Error("fs.writeFileSync not available in browser")
}
export function writeFile() {
  return Promise.reject(new Error("fs.writeFile not available in browser"))
}
export const mkdirSync = () => undefined
export const mkdir = () => Promise.resolve(undefined)
export const readdirSync = () => []
export const readdir = () => Promise.resolve([])
export function statSync() {
  return {
    isFile: () => false,
    isDirectory: () => false
  }
}
export function stat() {
  return Promise.resolve({ isFile: () => false, isDirectory: () => false })
}
export function lstatSync() {
  return {
    isFile: () => false,
    isDirectory: () => false
  }
}
export function lstat() {
  return Promise.resolve({ isFile: () => false, isDirectory: () => false })
}
export const accessSync = () => undefined
export function createReadStream() {
  throw new Error("fs.createReadStream not available in browser")
}
export function createWriteStream() {
  throw new Error("fs.createWriteStream not available in browser")
}
export const promises = {
  readFile,
  writeFile,
  mkdir,
  readdir,
  stat,
  lstat,
  access: Promise.resolve
}
export default {
  existsSync,
  readFileSync,
  readFile,
  writeFileSync,
  writeFile,
  mkdirSync,
  mkdir,
  readdirSync,
  readdir,
  statSync,
  stat,
  lstatSync,
  lstat,
  accessSync,
  createReadStream,
  createWriteStream,
  promises
}
