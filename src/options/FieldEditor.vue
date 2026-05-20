<script setup lang="ts">
import { reactive } from "vue"
import { resolveFieldType, fieldLabels, subFieldLabels } from "./field-meta"
import { formatCode } from "./format-code"
import FunctionEditor from "./FunctionEditor.vue"

interface Entry {
  key: string
  value: unknown
}

const props = defineProps<{
  entries: Entry[]
  parentKey?: string
  excludeFunctions?: boolean
}>()
const emit = defineEmits<{
  change: [key: string, value: unknown]
}>()

const t = browser.i18n.getMessage.bind(browser.i18n)

const fnMode = reactive<Record<string, boolean>>({})

function shouldRender(entry: Entry): boolean {
  if (!props.excludeFunctions) return true
  const type = resolveFieldType(entry.key, props.parentKey, entry.value)
  return !type.includes("function")
}

function fullKey(key: string): string {
  return props.parentKey ? `${props.parentKey}.${key}` : key
}

function isFnMode(key: string): boolean {
  return fnMode[fullKey(key)] ?? false
}

function toggleFnMode(key: string) {
  const k = fullKey(key)
  fnMode[k] = !(fnMode[k] ?? false)
}

function metaFor(key: string) {
  const k = fullKey(key)
  const m = subFieldLabels[k] || fieldLabels[key]
  if (!m) return { label: key, description: "" }
  return {
    label: t(m.labelKey),
    description: m.descKey ? t(m.descKey) : ""
  }
}

function onEntryChange(key: string, value: unknown) {
  emit("change", fullKey(key), value)
}

function onSubChange(key: string, value: unknown) {
  emit("change", key, value)
}

function valAsStr(v: unknown): string {
  if (typeof v === "function") return formatCode(v.toString())
  const s = String(v ?? "")
  return s.includes("function") || s.includes("=>") ? formatCode(s) : s
}
</script>

<template>
  <div class="field-editor">
    <template v-for="entry in entries" :key="entry.key">
      <div
        v-if="shouldRender(entry)"
        class="field-row"
      >
        <template v-if="resolveFieldType(entry.key, props.parentKey, entry.value) === 'object'">
          <div class="field-label">{{ metaFor(entry.key).label }}</div>
          <div v-if="metaFor(entry.key).description" class="field-desc">{{ metaFor(entry.key).description }}</div>
          <FieldEditor
            :entries="Object.entries(entry.value as Record<string, unknown>).map(([k, v]) => ({ key: k, value: v }))"
            :parent-key="parentKey ? `${parentKey}.${entry.key}` : entry.key"
            :exclude-functions="excludeFunctions"
            class="nested"
            @change="onSubChange"
          />
        </template>

      <template v-else-if="resolveFieldType(entry.key, props.parentKey, entry.value) === 'function'">
        <div class="field-label">
          <label :for="'f-' + entry.key">{{ metaFor(entry.key).label }}</label>
        </div>
        <div v-if="metaFor(entry.key).description" class="field-desc">{{ metaFor(entry.key).description }}</div>
        <FunctionEditor
          :model-value="formatCode((entry.value as Function).toString())"
          @update:model-value="(v: string) => onEntryChange(entry.key, v)"
        />
      </template>

      <template v-else-if="resolveFieldType(entry.key, props.parentKey, entry.value) === 'string|function'">
        <div class="field-label">
          <label>{{ metaFor(entry.key).label }}</label>
          <n-switch
            :value="isFnMode(entry.key)"
            @update:value="() => toggleFnMode(entry.key)"
            size="small"
            style="margin-left: 8px"
          >
            <template #checked>ƒ</template>
            <template #unchecked>abc</template>
          </n-switch>
        </div>
        <div v-if="metaFor(entry.key).description" class="field-desc">{{ metaFor(entry.key).description }}</div>
        <FunctionEditor
          v-if="isFnMode(entry.key)"
          :model-value="valAsStr(entry.value)"
          @update:model-value="(v: string) => onEntryChange(entry.key, v)"
        />
        <n-input
          v-else
          :value="valAsStr(entry.value)"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 6 }"
          @update:value="(v: string) => onEntryChange(entry.key, v)"
        />
      </template>

      <template v-else-if="resolveFieldType(entry.key, props.parentKey, entry.value) === 'boolean'">
        <n-space align="center">
          <n-switch
            :value="entry.value as boolean"
            @update:value="(v: boolean) => onEntryChange(entry.key, v)"
          />
          <span class="field-label">{{ metaFor(entry.key).label }}</span>
        </n-space>
        <div v-if="metaFor(entry.key).description" class="field-desc">{{ metaFor(entry.key).description }}</div>
      </template>

      <template v-else-if="resolveFieldType(entry.key, props.parentKey, entry.value) === 'string[]'">
        <div class="field-label">
          <label :for="'a-' + entry.key">{{ metaFor(entry.key).label }}</label>
        </div>
        <div v-if="metaFor(entry.key).description" class="field-desc">{{ metaFor(entry.key).description }}</div>
        <n-dynamic-tags
          :value="entry.value as string[]"
          @update:value="(v: string[]) => onEntryChange(entry.key, v)"
        />
      </template>

      <template v-else-if="resolveFieldType(entry.key, props.parentKey, entry.value) === 'number'">
        <div class="field-label">
          <label :for="'n-' + entry.key">{{ metaFor(entry.key).label }}</label>
        </div>
        <div v-if="metaFor(entry.key).description" class="field-desc">{{ metaFor(entry.key).description }}</div>
        <n-input-number
          :value="entry.value as number"
          :style="{ width: '200px' }"
          @update:value="(v: number | null) => onEntryChange(entry.key, v ?? 0)"
        />
      </template>

      <template v-else>
        <div class="field-label">
          <label :for="'s-' + entry.key">{{ metaFor(entry.key).label }}</label>
        </div>
        <div v-if="metaFor(entry.key).description" class="field-desc">{{ metaFor(entry.key).description }}</div>
        <n-input
          :id="'s-' + entry.key"
          :value="entry.value as string"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 6 }"
          @update:value="(v: string) => onEntryChange(entry.key, v)"
        />
      </template>
      </div>
    </template>
  </div>
</template>

<style scoped>
.field-editor {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.field-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.field-label {
  font-weight: 600;
  font-size: 0.9rem;
}
.field-desc {
  font-size: 0.8rem;
  opacity: 0.6;
}
.nested {
  margin-left: 1rem;
  padding-left: 1rem;
  border-left: 2px solid #444;
}
</style>
