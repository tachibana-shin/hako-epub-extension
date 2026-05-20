import type { SiteConfig } from "../contentScripts/registry"

const STORAGE_KEY = "registry-overrides"

export interface SerializedSiteConfig {
  [key: string]: unknown
}

function isFunctionString(str: string): boolean {
  return /^\s*(async\s+)?function\s*[*(]/.test(str) || /^\s*(async\s+)?\([\s\S]*\)\s*=>/.test(str)
}

export function serializeConfig(config: Partial<SiteConfig>): SerializedSiteConfig {
  const result: SerializedSiteConfig = {}
  for (const [key, value] of Object.entries(config)) {
    result[key] = typeof value === "function" ? value.toString() : value
  }
  return result
}

export function deserializeConfig(serialized: SerializedSiteConfig): Partial<SiteConfig> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(serialized)) {
    result[key] =
      typeof value === "string" && isFunctionString(value)
        ? new Function(`return ${value}`)()
        : value
  }
  return result as Partial<SiteConfig>
}

export async function getOverride(
  domain: string
): Promise<Partial<SiteConfig> | null> {
  const result = await browser.storage.sync.get(STORAGE_KEY)
  const overrides = (result[STORAGE_KEY] as Record<string, SerializedSiteConfig>) || {}
  return overrides[domain] ? deserializeConfig(overrides[domain]) : null
}

export async function setOverride(
  domain: string,
  config: SerializedSiteConfig
): Promise<void> {
  const result = await browser.storage.sync.get(STORAGE_KEY)
  const overrides = (result[STORAGE_KEY] as Record<string, SerializedSiteConfig>) || {}
  overrides[domain] = config
  await browser.storage.sync.set({ [STORAGE_KEY]: overrides })
}

export async function removeOverride(domain: string): Promise<void> {
  const result = await browser.storage.sync.get(STORAGE_KEY)
  const overrides = (result[STORAGE_KEY] as Record<string, SerializedSiteConfig>) || {}
  delete overrides[domain]
  await browser.storage.sync.set({ [STORAGE_KEY]: overrides })
}

export async function getAllOverrides(): Promise<Record<string, SerializedSiteConfig>> {
  const result = await browser.storage.sync.get(STORAGE_KEY)
  return (result[STORAGE_KEY] as Record<string, SerializedSiteConfig>) || {}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mergeConfigs(base: SiteConfig, override: Record<string, any>): SiteConfig {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const merged: any = { ...base }
  for (const [key, value] of Object.entries(override)) {
    if (value === undefined) continue
    if (
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof (base as any)[key] === "object" &&
      !Array.isArray((base as any)[key])
    ) {
      merged[key] = { ...(base as any)[key], ...value }
    } else {
      merged[key] = value
    }
  }
  return merged
}
