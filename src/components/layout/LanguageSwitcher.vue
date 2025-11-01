<template>
  <v-select
    :items="localeItems"
    :label="localeStore.t('language.label')"
    :model-value="currentLocale"
    class="language-switcher"
    density="compact"
    hide-details
    style="max-width: 140px"
    variant="outlined"
    @update:model-value="handleUpdate"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useLocaleStore } from '@/stores/locale'
import type { LocaleKey } from '@/locales'

const localeStore = useLocaleStore()
const { currentLocale, availableLocales } = storeToRefs(localeStore)

const localeItems = computed(() =>
  availableLocales.value.map((locale) => ({
    title: localeStore.t(`language.options.${locale}`),
    value: locale
  }))
)

function handleUpdate(value: string | null) {
  if (!value) return
  localeStore.setLocale(value as LocaleKey)
}
</script>
