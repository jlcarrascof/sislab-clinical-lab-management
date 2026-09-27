import { createI18n } from 'vue-i18n'
import { readStorage, writeStorage } from '@/utils/storage'
import en from './locales/en'
import es from './locales/es'

/** English is the source of truth: every other locale must match its shape */
export type MessageSchema = typeof en

export const SUPPORTED_LOCALES = ['en', 'es'] as const
export type AppLocale = (typeof SUPPORTED_LOCALES)[number]

const STORAGE_KEY = 'sislab.locale'

function isSupported(value: string | null): value is AppLocale {
  return !!value && (SUPPORTED_LOCALES as readonly string[]).includes(value)
}

/** Saved preference → browser language → English */
function detectLocale(): AppLocale {
  const saved = readStorage(localStorage, STORAGE_KEY)
  if (isSupported(saved)) return saved
  const browser = navigator.language?.slice(0, 2).toLowerCase() ?? ''
  return isSupported(browser) ? browser : 'en'
}

export const i18n = createI18n({
  legacy: false,
  locale: detectLocale(),
  fallbackLocale: 'en',
  messages: { en, es },
})

export function setLocale(locale: AppLocale) {
  i18n.global.locale.value = locale
  writeStorage(localStorage, STORAGE_KEY, locale)
  document.documentElement.lang = locale
}

document.documentElement.lang = i18n.global.locale.value
