<template>
  <div class="language-switcher">
    <label :for="selectId" class="sr-only">
      {{ localeStore.t('language.label') }}
    </label>
    <select
      :id="selectId"
      class="language-select"
      :value="currentLocale"
      @change="handleChange"
      @click.stop
    >
      <option
        v-for="locale in availableLocales"
        :key="locale"
        :value="locale"
      >
        {{ localeStore.t(`language.options.${locale}`) }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useLocaleStore } from '@/stores/locale'
import type { LocaleKey } from '@/locales'

const localeStore = useLocaleStore()
const { currentLocale, availableLocales } = storeToRefs(localeStore)

const selectId = computed(() => `language-${currentLocale.value}`)

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  localeStore.setLocale(target.value as LocaleKey)
}
</script>

<style scoped>
.language-switcher {
  position: relative;
}

.language-select {
  appearance: none;
  background-color: white;
  border: 1px solid var(--slate-300);
  border-radius: var(--radius-md);
  padding: 0.4rem 1.75rem 0.4rem 0.75rem;
  color: var(--navy-700);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.language-select:focus {
  outline: none;
  border-color: var(--blue-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.language-select:hover {
  border-color: var(--blue-400);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.language-switcher::after {
  content: '';
  position: absolute;
  right: 0.65rem;
  top: 50%;
  transform: translateY(-50%);
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid var(--navy-500);
  pointer-events: none;
}
</style>
