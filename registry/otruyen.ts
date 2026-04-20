// eslint-disable-next-line ts/ban-ts-comment
// @ts-expect-error
import dammy from "./dammy.ts"

export default defineRegistry({
  ...dammy,
  domains: ["otruyen.vn"],
  publisher: "otruyen.vn"
})
