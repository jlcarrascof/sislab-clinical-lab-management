<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { setLocale, SUPPORTED_LOCALES, type AppLocale } from '@/i18n'

const { locale, t } = useI18n()
</script>

<template>
  <div
    role="group"
    :aria-label="t('preferences.language')"
    class="inline-flex rounded-lg border border-gray-200 p-0.5 text-xs dark:border-gray-700"
  >
    <button
      v-for="code in SUPPORTED_LOCALES"
      :key="code"
      type="button"
      :aria-pressed="locale === code"
      class="rounded-md px-2 py-1 font-medium uppercase transition-colors"
      :class="
        locale === code
          ? 'bg-brand-600 text-white'
          : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100'
      "
      @click="setLocale(code as AppLocale)"
    >
      {{ code }}
    </button>
  </div>
</template>
