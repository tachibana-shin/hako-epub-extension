import type { Plugin } from "vite"
import fs from "node:fs"
import { dirname, relative, resolve } from "node:path"
import { getRegistry, r } from "../scripts/utils"

export function registryPlugin(): Plugin {
  const virtualModuleId = "virtual:registry"
  const resolvedVirtualModuleId = `r${virtualModuleId}`

  return {
    name: "registry-plugin",
    resolveId(id: string) {
      if (id.endsWith("?all-registry")) {
        return resolvedVirtualModuleId
      }
      if (id.endsWith("?registry-domains")) {
        return `${resolvedVirtualModuleId}-domains`
      }
    },
    async load(id: string) {
      if (id === resolvedVirtualModuleId) {
        const registryDir = r("registry")
        const files = fs
          .readdirSync(registryDir)
          .filter((file) => file.endsWith(".ts") && file !== "index.ts" && file !== "types.ts")

        const imports = files
          .map(
            (file, i) =>
              `import site${i} from "${relative(dirname(import.meta.dirname), resolve(registryDir, file)).replace(/\\/g, "/")}"`
          )
          .join("\n")
        const ids = files.map((f) => f.replace(/\.ts$/, ""))
        const items = ids.map((id, i) => `{ id: "${id}", config: site${i} }`)
        const exports = `export default [${items.join(", ")}]`

        return `${imports}\n${exports}`
      }

      if (id === `${resolvedVirtualModuleId}-domains`) {
        const registry = await getRegistry()
        const domains = registry.flatMap((s) => s.domains)
        return `export default ${JSON.stringify(domains)}`
      }
    }
  }
}
