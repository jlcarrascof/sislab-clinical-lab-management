<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { NAV_ITEMS } from '@/config/navigation'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
const router = useRouter()
const { t } = useI18n()

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
  <div class="flex min-h-screen bg-gray-50 dark:bg-gray-950">
    <aside
      class="fixed flex h-full w-60 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
    >
      <div class="border-b border-gray-200 p-4 dark:border-gray-800">
        <div class="flex items-center gap-2">
          <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600">
            <span class="text-xs font-bold text-white">SL</span>
          </div>
          <div class="min-w-0">
            <p class="text-sm font-semibold text-gray-800 dark:text-gray-100">{{ t('app.name') }}</p>
            <p class="truncate text-xs text-gray-400">{{ auth.tenant?.name }}</p>
          </div>
        </div>
      </div>

      <nav :aria-label="t('layout.mainMenu')" class="flex-1 space-y-0.5 overflow-y-auto p-3">
        <RouterLink
          v-for="item in visibleMenu"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          active-class="!bg-brand-50 !text-brand-700 font-medium dark:!bg-brand-950 dark:!text-brand-300"
        >
          <span aria-hidden="true">{{ item.icon }}</span>
          <span>{{ t(`nav.${item.key}`) }}</span>
        </RouterLink>
      </nav>

      <div class="space-y-2 border-t border-gray-200 p-3 dark:border-gray-800">
        <div class="flex items-center gap-2 px-3 py-1">
          <div
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-800 dark:bg-brand-900 dark:text-brand-100"
          >
            {{ initials }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-xs font-medium text-gray-700 dark:text-gray-200">
              {{ auth.user?.full_name }}
            </p>
            <p class="truncate text-xs text-gray-400">
              {{ auth.user ? t(`roles.${auth.user.role}`) : '' }}
            </p>
          </div>
        </div>
        <div class="flex items-center justify-between gap-2 px-3">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
        <button
          type="button"
          class="w-full rounded-lg px-3 py-1.5 text-left text-xs text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
          @click="handleLogout"
        >
          {{ t('layout.logout') }}
        </button>
      </div>
    </aside>

    <main class="ml-60 flex-1">
      <RouterView />
    </main>
  </div>
</template>
