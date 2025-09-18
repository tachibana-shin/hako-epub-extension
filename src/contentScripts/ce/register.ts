import { defineCustomElement } from "vue"

import css from "../.generated/css"

import DownloadVolume from "./DownloadVolume.ce.vue"
import XRadialProgress from "./XRadialProgress.ce.vue"

const DownloadVolumeElement = defineCustomElement(DownloadVolume, {
  shadowRoot: true,
  styles: [css]
})
const XRadialProgressElement = defineCustomElement(XRadialProgress, {
  // shadowRoot: true,
  // styles: [css]
})

export function register() {
  customElements.define("x-radial-progress", XRadialProgressElement)
  customElements.define("download-volume", DownloadVolumeElement)
}
