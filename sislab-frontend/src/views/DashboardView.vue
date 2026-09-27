<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()

const kpis = [
  { label: 'Órdenes hoy', color: 'text-brand-600' },
  { label: 'Pacientes atendidos', color: 'text-blue-600' },
  { label: 'Citas hoy', color: 'text-purple-600' },
  { label: 'Pendientes', color: 'text-orange-600' },
]
</script>

<template>
  <div class="p-8">
    <h1 class="mb-1 text-2xl font-semibold text-gray-800">
      Hola, {{ auth.user?.first_name }}
    </h1>
    <p class="text-sm text-gray-500">
      {{ auth.tenant?.name }} · Los KPIs se implementan en el Sprint 10.
    </p>

    <div class="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
      <div
        v-for="kpi in kpis"
        :key="kpi.label"
        class="rounded-xl border border-gray-200 bg-white p-4 text-center"
      >
        <p class="text-3xl font-bold" :class="kpi.color">—</p>
        <p class="mt-1 text-xs text-gray-400">{{ kpi.label }}</p>
      </div>
    </div>
  </div>
</template>
