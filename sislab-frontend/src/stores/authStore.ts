import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { apiClient, rawClient, registerAuthBridge } from '@/api/client'
import { clearSession, loadSession, saveSession } from '@/api/session'
import type { LoginResponse, Tenant, User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  // Restore the session when the store is created (page reload)
  const stored = loadSession()
  const user = ref<User | null>(stored?.user ?? null)
  const tenant = ref<Tenant | null>(stored?.tenant ?? null)
  const accessToken = ref<string | null>(stored?.accessToken ?? null)
  const refreshToken = ref<string | null>(stored?.refreshToken ?? null)

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)

  function persist() {
    if (accessToken.value && refreshToken.value && user.value && tenant.value) {
      saveSession({
        accessToken: accessToken.value,
        refreshToken: refreshToken.value,
        user: user.value,
        tenant: tenant.value,
      })
    }
  }

  function reset() {
    user.value = null
    tenant.value = null
    accessToken.value = null
    refreshToken.value = null
    clearSession()
  }

  async function login(email: string, password: string) {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', { email, password })
    user.value = data.user
    tenant.value = data.tenant
    accessToken.value = data.access_token
    refreshToken.value = data.refresh_token
    persist()
  }

  async function logout() {
    const token = refreshToken.value
    reset()
    if (token) {
      // Revoke the refresh token server-side; if it fails we still sign out locally
      await rawClient.post('/auth/logout', { refresh_token: token }).catch(() => undefined)
    }
  }

  registerAuthBridge({
    getAccessToken: () => accessToken.value,
    getRefreshToken: () => refreshToken.value,
    onRefreshed: (tokens) => {
      accessToken.value = tokens.access_token
      refreshToken.value = tokens.refresh_token
      persist()
    },
    onSessionExpired: () => {
      reset()
      // Dynamic import avoids a store ↔ router circular dependency
      void import('@/router').then(({ default: router }) =>
        router.push({ path: '/login', query: { expired: '1' } }),
      )
    },
  })

  return { user, tenant, accessToken, isAuthenticated, login, logout }
})
