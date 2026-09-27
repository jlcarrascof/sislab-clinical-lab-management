<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div class="p-8">
    <h1 class="mb-1 text-2xl font-semibold text-gray-800">{{ route.meta.title }}</h1>
    <p class="text-sm text-gray-500">Este módulo se implementa en el Sprint {{ route.meta.sprint }}.</p>
  </div>
</template>
