// update list in readme.md <!-- @list website support --> to <!-- @end -->
// read list website in registry.ts
import fs from "node:fs"
import { resolve } from "node:path"
import { getRegistry } from "./utils"

async function main() {
  const sites = await getRegistry()

  const readmePath = resolve(import.meta.dirname, "../README.md")
  const readme = fs.readFileSync(readmePath, "utf-8")

  const start = readme.indexOf("<!-- @list website support -->")
  const end = readme.indexOf("<!-- @end -->")

  if (start !== -1 && end !== -1) {
    const list = sites
      .map((site) => site.domains)
      .flat()
      .map((domain) => `- https://${domain}`)
      .join("\n")

    const newReadme = `${readme.substring(0, start)}<!-- @list website support -->\n${list}\n${readme.substring(end)}`

    fs.writeFileSync(readmePath, newReadme)
  }
}

void main()
