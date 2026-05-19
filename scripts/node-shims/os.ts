export const EOL = "\n"
export const platform = () => "browser"
export const arch = () => "javascript"
export const type = () => "Browser"
export const release = () => "0"
export const homedir = () => "/"
export const tmpdir = () => "/tmp"
export const hostname = () => "localhost"
export const endianness = () => "LE"
export const cpus = () => []
export const totalmem = () => 0
export const freemem = () => 0
export const networkInterfaces = () => ({})
export function userInfo() {
  return {
    username: "user",
    uid: 0,
    gid: 0,
    shell: "/bin/sh",
    homedir: "/"
  }
}
export default {
  EOL,
  platform,
  arch,
  type,
  release,
  homedir,
  tmpdir,
  hostname,
  endianness,
  cpus,
  totalmem,
  freemem,
  networkInterfaces,
  userInfo
}
