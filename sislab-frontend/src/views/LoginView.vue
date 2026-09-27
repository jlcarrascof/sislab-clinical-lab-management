<script setup lang="ts">
import { isAxiosError } from 'axios'
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { TENANT_SLUG } from '@/api/client'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const form = reactive({ email: '', password: '' })
const touched = reactive({ email: false, password: false })
const loading = ref(false)
const serverError = ref('')
const sessionExpired = route.query.expired === '1'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const errors = computed(() => ({
  email: !form.email ? 'El email es requerido' : !EMAIL_RE.test(form.email) ? 'Email inválido' : '',
  password: !form.password
    ? 'La contraseña es requerida'
    : form.password.length < 6
      ? 'Mínimo 6 caracteres'
      : '',
}))
const isValid = computed(() => !errors.value.email && !errors.value.password)

function messageFrom(e: unknown): string {
  if (isAxiosError(e)) {
    if (!e.response) return 'No se pudo conectar con el servidor'
    const msg = (e.response.data as { message?: string | string[] })?.message
    if (Array.isArray(msg)) return msg[0] ?? 'Datos inválidos'
    if (msg) return msg
  }
  return 'Error al iniciar sesión'
}

async function handleSubmit() {
  touched.email = touched.password = true
  if (!isValid.value || loading.value) return

  loading.value = true
  serverError.value = ''
  try {
    await auth.login(form.email.trim(), form.password)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard'
    await router.replace(redirect.startsWith('/') ? redirect : '/dashboard')
  } catch (e) {
    serverError.value = messageFrom(e)
  } finally {
    loading.value = false
  }
}

function inputClass(field: 'email' | 'password') {
  const invalid = touched[field] && errors.value[field]
  return [
    'w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2',
    invalid
      ? 'border-red-400 focus:ring-red-200'
      : 'border-gray-300 focus:border-brand-500 focus:ring-brand-100',
  ]
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-gray-50 p-4">
    <div class="w-full max-w-sm">
      <div class="mb-8 text-center">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600">
          <span class="text-2xl font-bold text-white">SL</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-800">SisLab</h1>
        <p class="mt-1 text-sm text-gray-500">Sistema de Control de Laboratorios Clínicos</p>
      </div>

      <form
        class="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        novalidate
        @submit.prevent="handleSubmit"
      >
        <p
          v-if="sessionExpired && !serverError"
          class="rounded-lg bg-amber-50 p-2 text-xs text-amber-800"
        >
          Tu sesión expiró. Volvé a iniciar sesión.
        </p>

        <div>
          <label for="email" class="mb-1 block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            autocomplete="username"
            placeholder="usuario@laboratorio.com"
            :class="inputClass('email')"
            @blur="touched.email = true"
          />
          <p v-if="touched.email && errors.email" class="mt-1 text-xs text-red-600">
            {{ errors.email }}
          </p>
        </div>

        <div>
          <label for="password" class="mb-1 block text-sm font-medium text-gray-700">
            Contraseña
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
          <p v-if="touched.password && errors.password" class="mt-1 text-xs text-red-600">
            {{ errors.password }}
          </p>
        </div>

        <p v-if="serverError" role="alert" class="rounded-lg bg-red-50 p-2 text-xs text-red-700">
          {{ serverError }}
        </p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {{ loading ? 'Iniciando sesión…' : 'Ingresar al sistema' }}
        </button>
      </form>

      <p class="mt-4 text-center text-xs text-gray-400">Laboratorio: {{ TENANT_SLUG }}</p>
    </div>
  </main>
</template>
