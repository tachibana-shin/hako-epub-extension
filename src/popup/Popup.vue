<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { darkTheme } from "naive-ui";
import type { SiteConfig } from "../contentScripts/registry";
import { fieldLabels, groupOrder } from "../options/field-meta";
import {
  setOverride,
  removeOverride,
  getAllOverrides,
} from "../logic/registry-storage";
import FieldEditor from "../options/FieldEditor.vue";

import registryEntries from "../../registry?all-registry";

const darkMode = ref(false);
onMounted(() => {
  const saved = localStorage.getItem("hako-epub-options-dark");
  if (saved !== null) {
    darkMode.value = saved === "true";
  } else {
    darkMode.value = window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  const color = darkMode.value ? "#18181c" : "#fff";
  document.documentElement.style.backgroundColor = color;
  document.body.style.backgroundColor = color;

  detectCurrentTabRegistry();
});

watch(darkMode, (v) => {
  localStorage.setItem("hako-epub-options-dark", String(v));
  const color = v ? "#18181c" : "#fff";
  document.documentElement.style.backgroundColor = color;
  document.body.style.backgroundColor = color;
});

type RegistryEntry = { id: string; config: SiteConfig };
const allEntries = registryEntries as RegistryEntry[];

const selectedId = ref("");
const baseConfig = ref<SiteConfig | null>(null);
const draftRef = ref<Record<string, unknown>>({});
const savedOverrides = ref<Record<string, unknown>>({});
const hasUnsaved = ref(false);
const toastMsg = ref("");

function findEntry(id: string): RegistryEntry | undefined {
  return allEntries.find((e) => e.id === id);
}

async function detectCurrentTabRegistry() {
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];
    if (!activeTab || !activeTab.url) return;

    const url = new URL(activeTab.url);
    const host = url.hostname.replace(/^www\./, "");

    const matched = allEntries.find((e) =>
      e.config.domains.some((d) => host === d || host.endsWith("." + d)),
    );

    if (matched) {
      selectedId.value = matched.id;
    }
  } catch (err) {
    console.error("Failed to detect active tab registry:", err);
  }
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

function openMoreSettings() {
  const url = browser.runtime.getURL("dist/options/index.html") + (selectedId.value ? `?id=${selectedId.value}` : "");
  browser.tabs.create({ url });
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
    <div class="popup-container">
      <header class="header">
        <h2 class="title">{{ t("popupTitle") }}</h2>
        <n-space>
          <n-button @click="openMoreSettings" quaternary circle>
            <template #icon>
              <i-ic-round-settings />
            </template>
          </n-button>
          <n-button @click="darkMode = !darkMode" quaternary circle>
            <template #icon>
              <i-ic-round-dark-mode v-if="darkMode" />
              <i-ic-round-light-mode v-else />
            </template>
          </n-button>
        </n-space>
      </header>

      <main class="content">
        <div v-if="toastMsg" class="toast">{{ toastMsg }}</div>

        <n-space vertical :size="12">
          <template v-if="selectedId && baseConfig">
            <n-card size="small" :title="currentEntry ? currentEntry.id : selectedId">
              <div v-if="currentEntry" class="domains-info">
                {{ t("domainsLabel") }}
                {{ currentEntry.config.domains.join(", ") }}
              </div>
            </n-card>

            <div
              v-if="savedOverrides && Object.keys(savedOverrides).length > 0"
              class="badge"
            >
              {{ t("hasOverrideBadge") }}
            </div>

            <div class="editors-scroll">
              <n-space vertical :size="12">
                <n-card
                  v-for="g in groupedEntries()"
                  :key="g.group"
                  :title="groupTitle[g.group] || g.group"
                  :content-style="{ padding: '8px' }"
                  size="small"
                >
                  <FieldEditor :entries="g.entries" exclude-functions @change="onFieldChange" />
                </n-card>
              </n-space>
            </div>

            <n-space justify="end" :size="8">
              <n-button v-if="isDirty" type="primary" size="small" @click="saveConfig">
                {{ t("saveConfig") }}
              </n-button>
              <n-button
                v-if="
                  selectedId &&
                  savedOverrides &&
                  Object.keys(savedOverrides).length > 0
                "
                size="small"
                @click="resetConfig"
              >
                {{ t("resetConfig") }}
              </n-button>
            </n-space>
          </template>

          <div v-else class="not-supported">
            <n-empty :description="t('noRegistryForTab')">
              <template #extra>
                <n-button type="primary" size="small" @click="openMoreSettings">
                  {{ t("optionsTitle") }}
                </n-button>
              </template>
            </n-empty>
          </div>
        </n-space>
      </main>
    </div>
  </n-config-provider>
</template>

<style scoped>
.popup-container {
  width: 420px;
  max-height: 580px;
  display: flex;
  flex-direction: column;
  background: var(--n-body-color, #fff);
  color: var(--n-text-color, #333);
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid var(--n-border-color, #333);
}
.title {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
}
.content {
  padding: 12px;
  overflow-y: auto;
  flex: 1;
}
.editors-scroll {
  max-height: 320px;
  overflow-y: auto;
  padding-right: 4px;
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
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  display: inline-block;
  align-self: flex-start;
}
.domains-info {
  margin-top: 0.25rem;
  font-size: 0.8rem;
  opacity: 0.7;
}
.not-supported {
  padding: 24px 12px;
  display: flex;
  justify-content: center;
  align-items: center;
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
