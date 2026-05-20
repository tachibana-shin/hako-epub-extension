<script setup lang="ts">
import { Codemirror } from "vue-codemirror"
import { javascript } from "@codemirror/lang-javascript"
import { oneDark } from "@codemirror/theme-one-dark"
import { EditorView } from "@codemirror/view"
import { ref, watch } from "vue"
import { formatCode } from "./format-code"

const props = defineProps<{
  modelValue: string
}>()
const emit = defineEmits<{
  "update:modelValue": [value: string]
}>()

const extensions = [
  javascript(),
  oneDark,
  EditorView.lineWrapping,
]

const code = ref(formatCode(props.modelValue))
watch(() => props.modelValue, (v) => code.value = formatCode(v))
watch(code, (v) => emit("update:modelValue", v))
</script>

<template>
  <Codemirror
    :model-value="code"
    :extensions="extensions"
    :style="{ height: '200px', border: '1px solid #333', borderRadius: '4px', overflow: 'hidden' }"
    :autofocus="false"
    @update:model-value="code = $event"
  />
</template>
