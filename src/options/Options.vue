<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { darkTheme } from "naive-ui";
import type { SiteConfig } from "../contentScripts/registry";
import { fieldLabels, groupOrder } from "./field-meta";
import {
  setOverride,
  removeOverride,
  getAllOverrides,
} from "../logic/registry-storage";
import FieldEditor from "./FieldEditor.vue";

import registryEntries from "../../registry?all-registry";

const darkMode = ref(false);
onMounted(() => {
  const saved = localStorage.getItem("hako-epub-options-dark");
  if (saved !== null) {
    darkMode.value = saved === "true";
  } else {
    darkMode.value = window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  document.documentElement.style.backgroundColor = darkMode.value
    ? (darkTheme.common as any).bodyColor
    : "#fff";

  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  if (id) selectedId.value = id;
});
watch(darkMode, (v) => {
  localStorage.setItem("hako-epub-options-dark", String(v));
  document.documentElement.style.backgroundColor = v
    ? (darkTheme.common as any).bodyColor
    : "#fff";
});

type RegistryEntry = { id: string; config: SiteConfig };
const allEntries = registryEntries as RegistryEntry[];

const registryOptions = computed(() =>
  allEntries.map((e) => ({
    label: `${e.id} (${e.config.domains.join(", ")})`,
    value: e.id,
  })),
);

const selectedId = ref("");
const baseConfig = ref<SiteConfig | null>(null);
const draftRef = ref<Record<string, unknown>>({});
const savedOverrides = ref<Record<string, unknown>>({});
const hasUnsaved = ref(false);
const toastMsg = ref("");

function findEntry(id: string): RegistryEntry | undefined {
  return allEntries.find((e) => e.id === id);
}

async function loadConfig(id: string) {
  if (!id) {
    baseConfig.value = null;
    draftRef.value = {};
    savedOverrides.value = {};
    return;
  }
  const entry = findEntry(id);
  if (!entry) return;
  baseConfig.value = entry.config;

  const allOverrides = await getAllOverrides();
  const override = allOverrides?.[id] || {};
  savedOverrides.value = override;

  draftRef.value = buildDraft(entry.config, override);
  hasUnsaved.value = false;
}

watch(selectedId, (id) => {
  loadConfig(id);
  const url = new URL(location.href);
  if (id) url.searchParams.set("id", id);
  else url.searchParams.delete("id");
  history.replaceState(null, "", url.href);
});

function buildDraft(
  base: SiteConfig,
  override: Record<string, unknown>,
): Record<string, unknown> {
  const draft: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(base)) {
    if (key in override) {
      draft[key] = override[key];
    } else if (typeof value === "function") {
      draft[key] = value.toString();
    } else if (typeof value === "object" && !Array.isArray(value)) {
      draft[key] = { ...value };
    } else if (Array.isArray(value)) {
      draft[key] = [...value];
    } else {
      draft[key] = value;
    }
  }
  for (const [key, value] of Object.entries(override)) {
    if (!(key in draft)) {
      draft[key] = value;
    }
  }
  return draft;
}

function setDeep(obj: Record<string, unknown>, path: string, value: unknown) {
  const parts = path.split(".");
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!(parts[i] in current) || typeof current[parts[i]] !== "object") {
      current[parts[i]] = {};
    }
    current = current[parts[i]] as Record<string, unknown>;
  }
  current[parts[parts.length - 1]] = value;
}

function onFieldChange(key: string, value: unknown) {
  setDeep(draftRef.value, key, value);
  hasUnsaved.value = true;
}

const isDirty = computed(() => {
  if (!baseConfig.value) return false;
  return hasUnsaved.value;
});

async function saveConfig() {
  if (!selectedId.value) return;
  const serialized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(draftRef.value)) {
    serialized[key] = value;
  }
  await setOverride(selectedId.value, serialized);
  savedOverrides.value = { ...serialized };
  hasUnsaved.value = false;
  toastMsg.value = browser.i18n.getMessage("savedToast");
  setTimeout(() => (toastMsg.value = ""), 3000);
}

async function resetConfig() {
  if (!selectedId.value) return;
  await removeOverride(selectedId.value);
  savedOverrides.value = {};
  await loadConfig(selectedId.value);
  toastMsg.value = browser.i18n.getMessage("resetToast");
  setTimeout(() => (toastMsg.value = ""), 3000);
}

const currentEntry = computed(() =>
  selectedId.value ? findEntry(selectedId.value) : null,
);

function groupedEntries() {
  if (!baseConfig.value) return [];
  const groups: {
    group: string;
    entries: { key: string; value: unknown }[];
  }[] = groupOrder.map((g) => ({ group: g, entries: [] }));

  for (const [key, value] of Object.entries(draftRef.value)) {
    const meta = fieldLabels[key];
    const group = meta?.group || "other";
    let g = groups.find((g) => g.group === group);
    if (!g) {
      g = { group, entries: [] };
      groups.push(g);
    }
    g.entries.push({ key, value });
  }
  return groups.filter((g) => g.entries.length > 0);
}

const t = browser.i18n.getMessage.bind(browser.i18n);

const groupTitle: Record<string, string> = {
  basic: t("groupBasic"),
  selectors: t("groupSelectors"),
  object: t("groupObject"),
  functions: t("groupFunctions"),
  fetcher: t("groupFetcher"),
  other: t("groupOther"),
};
</script>

<template>
  <n-config-provider :theme="darkMode ? darkTheme : null">
    <n-layout class="options-layout">
      <n-layout-header class="header">
        <h1>{{ t("optionsTitle") }}</h1>
        <n-space>
          <n-button v-if="isDirty" type="primary" @click="saveConfig">
            {{ t("saveConfig") }}
          </n-button>
          <n-button
            v-if="
              selectedId &&
              savedOverrides &&
              Object.keys(savedOverrides).length > 0
            "
            @click="resetConfig"
          >
            {{ t("resetConfig") }}
          </n-button>
          <n-button @click="darkMode = !darkMode" quaternary circle>
            <template #icon>
              <i-ic-round-dark-mode v-if="darkMode" />
              <i-ic-round-light-mode v-else />
            </template>
          </n-button>
        </n-space>
      </n-layout-header>

      <n-layout-content class="content">
        <div v-if="toastMsg" class="toast">{{ toastMsg }}</div>

        <n-space vertical :size="16">
          <n-card :title="t('selectRegistry')">
            <n-select
              v-model:value="selectedId"
              :options="registryOptions"
              filterable
              :placeholder="t('selectRegistryPlaceholder')"
              clearable
            />
            <div v-if="currentEntry" class="domains-info">
              {{ t("domainsLabel") }}
              {{ currentEntry.config.domains.join(", ") }}
            </div>
          </n-card>

          <template v-if="selectedId && baseConfig">
            <div
              v-if="savedOverrides && Object.keys(savedOverrides).length > 0"
              class="badge"
            >
              {{ t("hasOverrideBadge") }}
            </div>

            <n-card
              v-for="g in groupedEntries()"
              :key="g.group"
              :title="groupTitle[g.group] || g.group"
              :content-style="{ padding: '12px' }"
              size="small"
            >
              <FieldEditor :entries="g.entries" @change="onFieldChange" />
            </n-card>
          </template>

          <n-empty
            v-else-if="selectedId && !baseConfig"
            :description="t('noConfigForId')"
          />
        </n-space>
      </n-layout-content>
    </n-layout>
  </n-config-provider>
</template>

<style scoped>
.options-layout {
  margin: 0 auto;
  padding: 1rem;
  min-height: 100vh;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--n-border-color, #333);
}
.header h1 {
  font-size: 1.5rem;
  margin: 0;
  padding: 1rem;
}
.content {
  padding-bottom: 2rem;
}
.toast {
  position: fixed;
  top: 1rem;
  right: 1rem;
  background: #18a058;
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  z-index: 1000;
  animation: fadeInOut 3s ease;
}
.badge {
  background: #f0a020;
  color: #000;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.85rem;
  display: inline-block;
}
.domains-info {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  opacity: 0.7;
}
@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  10% {
    opacity: 1;
    transform: translateY(0);
  }
  90% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-10px);
  }
}
</style>
