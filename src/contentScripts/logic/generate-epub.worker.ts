/// <reference lib="webworker" />

import { listen } from "@fcanvas/communicate"
import { setLocationHref } from "./patch-window"

import { type OptionsGenerateEpub, generateEpub } from "./generate-epub"

// eslint-disable-next-line ts/consistent-type-definitions
export type GenerateEpubWorkerType = {
  generate: (base: string, options: OptionsGenerateEpub) => Uint8Array
}
listen<GenerateEpubWorkerType, "generate">(
  globalThis,
  "generate",
  async (base, data) => {
    setLocationHref(base)
    try {
      return await generateEpub(data)
    }
    catch (error) {
      console.error(error)
      throw error
    }
  }
)
