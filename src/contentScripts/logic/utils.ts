export function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

export function isLocalUrl(url: string): boolean {
  return url.startsWith(location.origin) || url.startsWith("/")
}

export function getFetchUrl(url: string): string {
  return isLocalUrl(url) ? url : `${url}#cors`
}

export function getFetchCredentials(url: string): RequestCredentials {
  return isLocalUrl(url) ? "include" : "same-origin"
}
