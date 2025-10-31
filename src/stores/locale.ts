import { defineStore } from 'pinia'
import { computed, ref, watchEffect } from 'vue'
import type { Locale } from 'date-fns'
import { enUS, ru as ruLocale } from 'date-fns/locale'
import { messages, type LocaleKey } from '@/locales'

const STORAGE_KEY = 'instachatico_locale'

const dateLocales: Record<LocaleKey, Locale> = {
  en: enUS,
  ru: ruLocale
}

function resolveKey(path: string, source: Record<string, any> | undefined) {
  if (!source) return undefined
  return path.split('.').reduce<any>((acc, key) => {
    if (acc && typeof acc === 'object') {
      return acc[key]
    }
    return undefined
  }, source)
}

export const useLocaleStore = defineStore('locale', () => {
  const defaultLocale: LocaleKey = 'en'

  const stored =
    typeof window !== 'undefined'
      ? (window.localStorage.getItem(STORAGE_KEY) as LocaleKey | null)
      : null

  const currentLocale = ref<LocaleKey>(
    stored && stored in messages ? stored : defaultLocale
  )

  const availableLocales = computed<LocaleKey[]>(() => Object.keys(messages) as LocaleKey[])

  const fallbackMessages = messages.en

  const currentMessages = computed(() => messages[currentLocale.value])

  const dateLocale = computed(() => dateLocales[currentLocale.value])

  function setHtmlLang(locale: LocaleKey) {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale
    }
  }

  function setLocale(locale: LocaleKey) {
    if (!messages[locale]) return
    currentLocale.value = locale
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, locale)
    }
    setHtmlLang(locale)
  }

  function interpolate(text: string, vars?: Record<string, string | number>) {
    if (!vars) return text
    return text.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`))
  }

  function t(key: string, vars?: Record<string, string | number>): string {
    let message = resolveKey(key, currentMessages.value)
    if (message === undefined) {
      message = resolveKey(key, fallbackMessages)
    }
    if (typeof message !== 'string') {
      return key
    }
    return interpolate(message, vars)
  }

  watchEffect(() => {
    setHtmlLang(currentLocale.value)
  })

  return {
    currentLocale,
    availableLocales,
    currentMessages,
    dateLocale,
    setLocale,
    t
  }
})
