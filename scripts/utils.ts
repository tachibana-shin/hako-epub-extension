import type { SiteConfig } from "../registry/types"
import fs from "node:fs"
import { join, resolve } from "node:path"
import process from "node:process"
import { pathToFileURL } from "node:url"

import { bgCyan, black } from "kolorist"
import { defineRegistry } from "../registry/types"

// eslint-disable-next-line no-restricted-globals
Object.assign(typeof self !== "undefined" ? self : global, { defineRegistry })

export const port = Number(process.env.PORT || "") || 3303
export const r = (...args: string[]) => resolve(__dirname, "..", ...args)
export const isDev = process.env.NODE_ENV !== "production"
export const isFirefox = process.env.EXTENSION === "firefox"

export function log(name: string, message: string) {
  console.log(black(bgCyan(` ${name} `)), message)
}

export async function getRegistry() {
  const registryDir = resolve(import.meta.dirname, "../registry")
  const files = fs
    .readdirSync(registryDir)
    .filter((file) => file.endsWith(".ts") && file !== "index.ts" && file !== "types.ts")

  const sites = await Promise.all(
    files.map(async (file) => {
      const mod = await import(pathToFileURL(resolve(join(registryDir, file))).href)
      return mod.default as SiteConfig
    })
  )
  return sites
}
