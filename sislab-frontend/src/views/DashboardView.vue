<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
const { t } = useI18n()

const kpis = [
  { key: 'ordersToday', color: 'text-brand-600 dark:text-brand-400' },
  { key: 'patientsServed', color: 'text-blue-600 dark:text-blue-400' },
  { key: 'appointmentsToday', color: 'text-purple-600 dark:text-purple-400' },
  { key: 'pending', color: 'text-orange-600 dark:text-orange-400' },
] as const
</script>

<template>
  <div class="p-8">
    <h1 class="mb-1 text-2xl font-semibold text-gray-800 dark:text-gray-100">
      {{ t('dashboard.greeting', { name: auth.user?.first_name }) }}
    </h1>
    <p class="text-sm text-gray-500 dark:text-gray-400">
      {{ auth.tenant?.name }} · {{ t('dashboard.kpisPending') }}
    </p>

    <div class="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
      <div
        v-for="kpi in kpis"
        :key="kpi.key"
        class="rounded-xl border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-gray-900"
      >
        <p class="text-3xl font-bold" :class="kpi.color">—</p>
        <p class="mt-1 text-xs text-gray-400">{{ t(`dashboard.kpis.${kpi.key}`) }}</p>
      </div>
    </div>
  </div>
</template>
