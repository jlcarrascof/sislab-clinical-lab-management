import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { RefreshResponse } from '@/types'

export const API_URL = import.meta.env.VITE_API_URL
export const TENANT_SLUG = import.meta.env.VITE_TENANT_SLUG

const baseConfig = {
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': TENANT_SLUG },
}

export const apiClient = axios.create(baseConfig)

/** Cliente sin interceptores: para /auth/refresh y /auth/logout (evita bucles) */
export const rawClient = axios.create(baseConfig)

/**
 * El authStore registra estos callbacks al crearse.
 * Así el cliente no importa el store (sin dependencias circulares).
 */
interface AuthBridge {
  getAccessToken: () => string | null
  getRefreshToken: () => string | null
  onRefreshed: (tokens: RefreshResponse) => void
  onSessionExpired: () => void
}

let bridge: AuthBridge | null = null
export function registerAuthBridge(b: AuthBridge) {
  bridge = b
}

apiClient.interceptors.request.use((config) => {
  const token = bridge?.getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Un único refresh en vuelo: los 401 simultáneos esperan la misma promesa
let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const refreshToken = bridge?.getRefreshToken()
  if (!refreshToken) throw new Error('Sin refresh token')

  const { data } = await rawClient.post<RefreshResponse>('/auth/refresh', {
    refresh_token: refreshToken,
  })
  bridge?.onRefreshed(data)
  return data.access_token
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined

    // Un 401 de /auth/* (p.ej. password incorrecto) no es una sesión expirada
    const isAuthEndpoint = original?.url?.startsWith('/auth/') ?? false
    if (
      error.response?.status !== 401 ||
      !original ||
      original._retry ||
      isAuthEndpoint ||
      !bridge?.getRefreshToken()
    ) {
      return Promise.reject(error)
    }
    original._retry = true

    try {
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null
      })
      const newToken = await refreshPromise
      original.headers.Authorization = `Bearer ${newToken}`
      return apiClient(original)
    } catch {
      bridge?.onSessionExpired()
      return Promise.reject(error)
    }
  },
)
