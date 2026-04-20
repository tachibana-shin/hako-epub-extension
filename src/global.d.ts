declare const __DEV__: boolean
/** Extension name, defined in packageJson.name */
declare const __NAME__: string

declare module "*.vue" {
  const component: any
  export default component
}
interface Buffer {
  arrayBuffer: () => ArrayBuffer
}

declare module "*?all-registry" {
  import type { SiteConfig } from "../registry/types"

  const registry: SiteConfig[]
  export default registry
}

declare module "*?all-registry-domains" {
  const domains: string[]
  export default domains
}
