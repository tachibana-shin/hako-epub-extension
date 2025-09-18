import type { ProtocolWithReturn } from "webext-bridge"
import type { OptionsGenerateEpub } from "./src/contentScripts/logic/generate-epub"

declare module "webext-bridge" {
  export interface ProtocolMap {
    // define message protocol types
    // see https://github.com/antfu/webext-bridge#type-safe-protocols
    "save-volume": ProtocolWithReturn<
      {
        slug: string
        options: OptionsGenerateEpub
        file: ArrayBuffer
      },
      { ok: boolean }
    >
  }
}

declare module "*?buffer&base64" {
  const buffer: ArrayBuffer
  export default buffer
}
