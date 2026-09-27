<script setup lang="ts">
import { isAxiosError } from 'axios'
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { TENANT_SLUG } from '@/api/client'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { useAuthStore } from '@/stores/authStore'

const MIN_PASSWORD = 6
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const { t } = useI18n()

const form = reactive({ email: '', password: '' })
const touched = reactive({ email: false, password: false })
const loading = ref(false)
/** i18n key, so the message follows language changes */
const serverErrorKey = ref('')
const sessionExpired = route.query.expired === '1'

const errors = computed(() => ({
  email: !form.email
    ? t('login.validation.emailRequired')
    : !EMAIL_RE.test(form.email)
      ? t('login.validation.emailInvalid')
      : '',
  password: !form.password
    ? t('login.validation.passwordRequired')
    : form.password.length < MIN_PASSWORD
      ? t('login.validation.passwordMin', { min: MIN_PASSWORD })
      : '',
}))
const isValid = computed(() => !errors.value.email && !errors.value.password)

/** Maps API failures to translated messages (the API itself answers in English) */
function errorKeyFrom(e: unknown): string {
  if (!isAxiosError(e)) return 'login.errors.generic'
  if (!e.response) return 'login.errors.network'
  switch (e.response.status) {
    case 400:
    case 401:
      return 'login.errors.invalidCredentials'
    case 403:
    case 404:
      return 'login.errors.tenant'
    default:
      return 'login.errors.generic'
  }
}

async function handleSubmit() {
  touched.email = touched.password = true
  if (!isValid.value || loading.value) return

  loading.value = true
  serverErrorKey.value = ''
  try {
    await auth.login(form.email.trim(), form.password)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard'
    await router.replace(redirect.startsWith('/') ? redirect : '/dashboard')
  } catch (e) {
    serverErrorKey.value = errorKeyFrom(e)
  } finally {
    loading.value = false
  }
}

function inputClass(field: 'email' | 'password') {
  const invalid = touched[field] && errors.value[field]
  return [
    'w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:ring-2',
    'dark:bg-gray-800 dark:text-gray-100',
    invalid
      ? 'border-red-400 focus:ring-red-200 dark:focus:ring-red-900'
      : 'border-gray-300 focus:border-brand-500 focus:ring-brand-100 dark:border-gray-600 dark:focus:ring-brand-900',
  ]
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-950">
    <div class="absolute top-4 right-4">
      <LanguageSwitcher />
    </div>

    <div class="w-full max-w-sm">
      <div class="mb-8 text-center">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600">
          <span class="text-2xl font-bold text-white">SL</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">{{ t('app.name') }}</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ t('app.tagline') }}</p>
      </div>

      <form
        class="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
        novalidate
        @submit.prevent="handleSubmit"
      >
        <p
          v-if="sessionExpired && !serverErrorKey"
          class="rounded-lg bg-amber-50 p-2 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200"
        >
          {{ t('login.sessionExpired') }}
        </p>

        <div>
          <label for="email" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('login.email') }}
          </label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            autocomplete="username"
            :placeholder="t('login.emailPlaceholder', { at: '@' })"
            :class="inputClass('email')"
            @blur="touched.email = true"
          />
          <p v-if="touched.email && errors.email" class="mt-1 text-xs text-red-600 dark:text-red-400">
            {{ errors.email }}
          </p>
        </div>

        <div>
          <label
            for="password"
            class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {{ t('login.password') }}
          </label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            placeholder="••••••••"
            :class="inputClass('password')"
            @blur="touched.password = true"
          />
          <p
            v-if="touched.password && errors.password"
            class="mt-1 text-xs text-red-600 dark:text-red-400"
          >
            {{ errors.password }}
          </p>
        </div>

        <p
          v-if="serverErrorKey"
          role="alert"
          class="rounded-lg bg-red-50 p-2 text-xs text-red-700 dark:bg-red-950 dark:text-red-300"
        >
          {{ t(serverErrorKey) }}
        </p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {{ loading ? t('login.submitting') : t('login.submit') }}
        </button>
      </form>

      <p class="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">
        {{ t('login.laboratory', { slug: TENANT_SLUG }) }}
      </p>
    </div>
  </main>
</template>
