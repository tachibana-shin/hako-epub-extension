import { put } from "@fcanvas/communicate"
import Worker from "./generate-epub.worker?worker&inline"
import type { OptionsGenerateEpub } from "./generate-epub"
import type { GenerateEpubWorkerType } from "./generate-epub.worker"

export function generateEpubWorker(
  options: OptionsGenerateEpub
): Promise<Uint8Array> {
  const worker = new Worker()

  return put<GenerateEpubWorkerType, "generate">(
    worker,
    "generate",
    `${location.protocol}//${location.host}/`,
    options
  )
}
