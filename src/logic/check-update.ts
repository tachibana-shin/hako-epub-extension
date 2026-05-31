import { version } from "../../package.json"

export interface UpdateInfo {
  hasUpdate: boolean
  latestVersion: string
  downloadUrl: string
}

const GITHUB_API = "https://api.github.com/repos/tachibana-shin/hako-epub-extension/releases/latest"
const STORAGE_KEY = "update-info"

function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map(Number)
  const pb = b.split(".").map(Number)
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) > (pb[i] || 0)) return 1
    if ((pa[i] || 0) < (pb[i] || 0)) return -1
  }
  return 0
}

export async function checkForUpdate(): Promise<UpdateInfo> {
  try {
    const res = await fetch(GITHUB_API)
    if (!res.ok) return { hasUpdate: false, latestVersion: "", downloadUrl: "" }

    const data = await res.json()
    const latestVersion = (data.tag_name as string).replace(/^v/, "")
    const hasUpdate = compareVersions(latestVersion, version) > 0

    return {
      hasUpdate,
      latestVersion,
      downloadUrl: data.html_url as string
    }
  } catch {
    return { hasUpdate: false, latestVersion: "", downloadUrl: "" }
  }
}

export { STORAGE_KEY }
