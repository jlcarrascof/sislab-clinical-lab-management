<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { NAV_ITEMS } from '@/config/navigation'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
const router = useRouter()

const visibleMenu = computed(() =>
  NAV_ITEMS.filter((item) => auth.user && item.roles.includes(auth.user.role)),
)

const initials = computed(() =>
  `${auth.user?.first_name?.[0] ?? ''}${auth.user?.last_name?.[0] ?? ''}`.toUpperCase(),
)

async function handleLogout() {
  await auth.logout()
  await router.replace('/login')
}
</script>

<template>
  <div class="flex min-h-screen bg-gray-50">
    <aside class="fixed flex h-full w-56 flex-col border-r border-gray-200 bg-white">
      <div class="border-b border-gray-200 p-4">
        <div class="flex items-center gap-2">
          <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600">
            <span class="text-xs font-bold text-white">SL</span>
          </div>
          <div class="min-w-0">
            <p class="text-sm font-semibold text-gray-800">SisLab</p>
            <p class="truncate text-xs text-gray-400">{{ auth.tenant?.name }}</p>
          </div>
        </div>
      </div>

      <nav class="flex-1 space-y-0.5 overflow-y-auto p-3">
        <RouterLink
          v-for="item in visibleMenu"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100"
          active-class="!bg-brand-50 !text-brand-700 font-medium"
        >
          <span aria-hidden="true">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="border-t border-gray-200 p-3">
        <div class="mb-1 flex items-center gap-2 px-3 py-2">
          <div
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-800"
          >
            {{ initials }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-xs font-medium text-gray-700">{{ auth.user?.full_name }}</p>
            <p class="text-xs text-gray-400">{{ auth.user?.role }}</p>
          </div>
        </div>
        <button
          type="button"
          class="w-full rounded-lg px-3 py-1.5 text-left text-xs text-red-600 transition-colors hover:bg-red-50"
          @click="handleLogout"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>

    <main class="ml-56 flex-1">
      <RouterView />
    </main>
  </div>
</template>
