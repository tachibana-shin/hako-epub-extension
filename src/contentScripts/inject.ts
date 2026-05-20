import type { SiteConfig } from "./registry"
import { toast } from "vue-sonner"
import { register } from "./ce/register"
import registry from "./registry"

register()

function isFunctionString(str: string): boolean {
  return /^\s*(async\s+)?function\s*[*(]/.test(str) || /^\s*(async\s+)?\([\s\S]*\)\s*=>/.test(str)
}

function deserializeConfig(serialized: Record<string, unknown>): Partial<SiteConfig> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(serialized)) {
    result[key] =
      typeof value === "string" && isFunctionString(value)
        ? new Function(`return ${value}`)()
        : value
  }
  return result as Partial<SiteConfig>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mergeConfigs(base: SiteConfig, override: Record<string, any>): SiteConfig {
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

function bind(config: SiteConfig) {
  document.querySelectorAll<HTMLElement>(config.findBlocks).forEach((h3) => {
    if (h3.querySelector("download-volume")) return

    const id = crypto.randomUUID()
    const downloadVolume = document.createElement("download-volume")

    // ▲ v-id の付与（章リスト）
    const targetEl = config.findTarget(h3)
    if (!targetEl) {
      toast("Target not found", {
        description: "Please check config"
      })

      return
    }

    targetEl.setAttribute("v-id", id)

    downloadVolume.setAttribute("target", id)

    const anyVolume = downloadVolume as any
    anyVolume.config = config
    anyVolume.source = h3

    h3.appendChild(downloadVolume)
  })
}

let watching = false
function injector() {
  const hostname = location.hostname.replace(/^www\./, "")
  let config = registry.find(
    (item) => item.domains.includes(location.hostname) || item.domains.includes(hostname)
  ) as SiteConfig | undefined
  if (!config) return console.warn("This domain not exists registry")

  // Merge user overrides from storage, injected by index.ts
  const overridesMap = (window as any).__registryOverrides as Record<string, unknown> | undefined
  const domainOverride = overridesMap?.[hostname] ?? overridesMap?.[location.hostname]
  if (domainOverride) {
    config = mergeConfigs(config, deserializeConfig(domainOverride as Record<string, unknown>))
  }

  if (config.customStyle) {
    if (document.getElementById("hako-epub-extension-style")) return

    const style = document.createElement("style")
    style.setAttribute("id", "hako-epub-extension-style")
    style.textContent = config.customStyle
    document.head.appendChild(style)
  }

  if (config.lazyDom && !watching) {
    watching = true
    let pending = true
    const observer = new MutationObserver(() => {
      if (pending) {
        pending = false
        requestAnimationFrame(() => {
          bind(config)
          pending = true
        })
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })
  }

  bind(config)
}

document.addEventListener("DOMContentLoaded", injector)
window.addEventListener("load", injector)

injector()
