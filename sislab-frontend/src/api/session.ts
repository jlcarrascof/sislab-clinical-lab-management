import type { Tenant, User } from '@/types'
import { readStorage, removeStorage, writeStorage } from '@/utils/storage'

/**
 * Session persistence in sessionStorage (cleared when the tab closes).
 * The only module that touches session storage: authStore and apiClient go through it.
 */
const KEY = 'sislab.session'

export interface StoredSession {
  accessToken: string
  refreshToken: string
  user: User
  tenant: Tenant
}

export function loadSession(): StoredSession | null {
  const raw = readStorage(sessionStorage, KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredSession
  } catch {
    return null
  }
}

export function saveSession(session: StoredSession): void {
  writeStorage(sessionStorage, KEY, JSON.stringify(session))
}

export function clearSession(): void {
  removeStorage(sessionStorage, KEY)
}
