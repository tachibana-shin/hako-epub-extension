export function toastShadow(msg: string, options?: ExternalToast) {
  const event = new CustomEvent("toast", {
    detail: { msg, options }
  })
  document.dispatchEvent(event)
}
