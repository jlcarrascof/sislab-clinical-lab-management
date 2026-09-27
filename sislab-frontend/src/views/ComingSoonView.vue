<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const route = useRoute()
const { t } = useI18n()
</script>

<template>
  <div class="p-8">
    <h1 class="mb-1 text-2xl font-semibold text-gray-800 dark:text-gray-100">
      {{ route.meta.titleKey ? t(route.meta.titleKey) : '' }}
    </h1>
    <p class="text-sm text-gray-500 dark:text-gray-400">
      {{ t('comingSoon.description', { sprint: route.meta.sprint }) }}
    </p>
  </div>
</template>
