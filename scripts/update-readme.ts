// update list in readme.md <!-- @list website support --> to <!-- @end -->
// read list website in registry.ts
import fs from "node:fs"
import { resolve } from "node:path"
import registry from "../src/contentScripts/registry"

const readme = fs.readFileSync(
  resolve(import.meta.dirname, "../README.md"),
  "utf-8"
)

const start = readme.indexOf("<!-- @list website support -->")
const end = readme.indexOf("<!-- @end -->")

const list = registry
  .map((site) => site.domains)
  .flat()
  .map((domain) => `- https://${domain}`)
  .join("\n")

const newReadme = `${readme.substring(0, start)}<!-- @list website support -->\n${list}\n${readme.substring(end)}`

fs.writeFileSync(resolve(import.meta.dirname, "../README.md"), newReadme)
