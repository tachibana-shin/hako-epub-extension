import type { ExternalToast } from "vue-sonner"

export function toastShadow(
  msg: string,
  type: "error" | "success" | string,
  options?: ExternalToast
) {
  const event = new CustomEvent("toast", {
    detail: { msg, options, type }
  })
  document.dispatchEvent(event)
}
