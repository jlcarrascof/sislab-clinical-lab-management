import type { Tenant, User } from '@/types'

/**
 * Persistencia de la sesión en sessionStorage (se borra al cerrar la pestaña).
 * Único lugar que toca el storage: authStore y apiClient pasan por acá.
 */
const KEY = 'sislab.session'

export interface StoredSession {
  accessToken: string
  refreshToken: string
  user: User
  tenant: Tenant
}

export function loadSession(): StoredSession | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as StoredSession) : null
  } catch {
    return null
  }
}

export function saveSession(session: StoredSession): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(session))
  } catch {
    /* storage bloqueado (modo privado): la sesión vive solo en memoria */
  }
}

export function clearSession(): void {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* noop */
  }
}
