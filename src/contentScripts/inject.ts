import { register } from "./ce/register"

register()

document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll(".volume-list:not(.disabled) > header > span.mobile-icon")
    .forEach((icon) => {
      const downloadVolume = document.createElement("download-volume")
      const volumeListEl = icon.closest(".volume-list")!

      const id = crypto.randomUUID()
      volumeListEl.setAttribute("v-id", id)

      downloadVolume.setAttribute("target", id)

      icon.appendChild(downloadVolume)
    })
})
