<script setup lang="ts">
import type { ExternalToast } from "vue-sonner"
import { useEventListener } from "@vueuse/core"
import { toast, Toaster } from "vue-sonner"
import "vue-sonner/style.css"
import "uno.css"
import { STORAGE_KEY, type UpdateInfo } from "~/logic/check-update"

// const [show, toggle] = useToggle(false)
useEventListener(
  document,
  "toast",
  (
    event: CustomEvent<{
      msg: string
      type: "error" | "success" | string
      options: ExternalToast
    }>
  ) => {
    const { msg, type, options } = event.detail

    if (type === "error") {
      toast.error(msg, options)
    } else if (type === "success") {
      toast.success(msg, options)
    } else {
      toast(msg, options)
    }
  }
)

const CHECKED_KEY = "update-checked-session"

onMounted(async () => {
  if (sessionStorage.getItem(CHECKED_KEY)) return
  sessionStorage.setItem(CHECKED_KEY, "1")

  try {
    const result = await browser.storage.local.get(STORAGE_KEY)
    const info = result[STORAGE_KEY] as UpdateInfo | undefined
    if (info?.hasUpdate) {
      toast(`Hako EPub phiên bản ${info.latestVersion} đã phát hành`, {
        action: {
          label: "Cập nhật",
          onClick: () => window.open(info.downloadUrl, "_blank")
        },
        duration: 10_000
      })
    }
  } catch {
    // storage not available, skip
  }
})
</script>

<template>
  <Toaster />
  <!-- <div
    class="fixed right-0 bottom-0 m-5 z-100 flex items-end font-sans select-none leading-1em"
  >
    <div
      v-show="show"
      class="bg-white text-gray-800 rounded-lg shadow w-max h-min"
      p="x-4 y-2"
      m="y-auto r-2"
      transition="opacity duration-300"
      :class="show ? 'opacity-100' : 'opacity-0'"
    >
      <h1 class="text-lg">Vitesse WebExt</h1>
      <SharedSubtitle />
    </div>
    <button
      class="flex w-10 h-10 rounded-full shadow cursor-pointer border-none"
      bg="teal-600 hover:teal-700"
      @click="toggle()"
    >
      <i-pixelarticons-power class="block m-auto text-white text-lg" />
    </button>
  </div> -->
</template>
