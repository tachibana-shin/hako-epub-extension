import fs from "node:fs"
import { resolve } from "node:path"
import type { Plugin } from "vite"
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
      if (id.endsWith("?all-registry-domains")) {
        return `${resolvedVirtualModuleId}-domains`
      }
    },
    async load(id: string) {
      if (id === resolvedVirtualModuleId) {
        const registryDir = r("registry")
        const files = fs
          .readdirSync(registryDir)
          .filter(
            (file) =>
              file.endsWith(".ts") && file !== "index.ts" && file !== "types.ts"
          )

        // Use absolute paths for imports in the virtual module.
        // Vite will handle these correctly.
        const imports = files
          .map(
            (file, i) => `import site${i} from "${resolve(registryDir, file)}"`
          )
          .join("\n")
        const exports = `export default [${files
          .map((_, i) => `site${i}`)
          .join(", ")}]`

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
