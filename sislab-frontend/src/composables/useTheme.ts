import { ref, watch } from 'vue'
import { readStorage, writeStorage } from '@/utils/storage'

export type ThemePreference = 'light' | 'dark' | 'system'

// Must match the inline script in index.html (it runs before the app to avoid a flash)
const STORAGE_KEY = 'sislab.theme'
const media = window.matchMedia('(prefers-color-scheme: dark)')

function readPreference(): ThemePreference {
  const saved = readStorage(localStorage, STORAGE_KEY)
  return saved === 'light' || saved === 'dark' ? saved : 'system'
}

function apply(pref: ThemePreference) {
  const dark = pref === 'dark' || (pref === 'system' && media.matches)
  document.documentElement.classList.toggle('dark', dark)
}

// Module-level state: every component shares the same preference
const preference = ref<ThemePreference>(readPreference())

watch(
  preference,
  (pref) => {
    writeStorage(localStorage, STORAGE_KEY, pref)
    apply(pref)
  },
  { immediate: true },
)

// Follow OS changes live while on "system"
media.addEventListener('change', () => {
  if (preference.value === 'system') apply('system')
})

const ORDER: ThemePreference[] = ['light', 'dark', 'system']

export function useTheme() {
  function cycle() {
    const next = ORDER[(ORDER.indexOf(preference.value) + 1) % ORDER.length]
    preference.value = next ?? 'system'
  }
  return { preference, cycle }
}
