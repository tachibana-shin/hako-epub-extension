import JSZip from "jszip"

/**
 * Edit multiple files inside an EPUB buffer.
 * Keys in `editors` are file paths inside the EPUB (e.g., "OEBPS/content.opf").
 * Values are functions that receive the file content (string if text, undefined if not found)
 * and return new content as string or Uint8Array.
 *
 * @param buffer Uint8Array of the EPUB file
 * @param editors Record of filePath -> editor function
 * @returns Edited EPUB as Uint8Array
 */
export async function editFilesInEPUB(
  buffer: Uint8Array,
  editors: Record<string, (content?: string) => string | Uint8Array>
): Promise<Uint8Array> {
  // load epub as zip
  const zip = await JSZip.loadAsync(buffer)

  for (const [path, editor] of Object.entries(editors)) {
    const file = zip.file(path)

    let originalContent: string | undefined
    if (file) {
      // try reading as text
      originalContent = await file.async("string")
    }

    // apply editor
    const newContent = editor(originalContent)

    // overwrite with new content
    zip.file(path, newContent)
  }

  // rebuild epub as Uint8Array
  return await zip.generateAsync({ type: "uint8array" })
}
