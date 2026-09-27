<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme'

const { preference, cycle } = useTheme()
const { t } = useI18n()

const ICONS = { light: '☀️', dark: '🌙', system: '💻' } as const

const label = computed(
  () => `${t('preferences.theme.label')}: ${t(`preferences.theme.${preference.value}`)}`,
)
</script>

<template>
  <button
    type="button"
    :title="label"
    :aria-label="label"
    class="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
    @click="cycle"
  >
    <span aria-hidden="true">{{ ICONS[preference] }}</span>
    <span>{{ t(`preferences.theme.${preference}`) }}</span>
  </button>
</template>
