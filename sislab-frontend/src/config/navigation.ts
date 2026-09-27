import { UserRole } from '@/types'
import type en from '@/i18n/locales/en'

const ALL = Object.values(UserRole)
const { ADMIN, TECHNICIAN, DOCTOR, RECEPTIONIST } = UserRole

export interface NavItem {
  /** Key under `nav.*` in the locale files */
  key: keyof typeof en.nav
  icon: string
  path: string
  roles: UserRole[]
  sprint: number
}

/**
 * Single source of truth for the menu AND route permissions:
 * the router uses `roles` to block direct access by URL.
 */
export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', icon: '📊', path: '/dashboard', roles: ALL, sprint: 10 },
  { key: 'patients', icon: '👥', path: '/patients', roles: [ADMIN, DOCTOR, RECEPTIONIST], sprint: 2 },
  { key: 'doctors', icon: '🩺', path: '/doctors', roles: [ADMIN, RECEPTIONIST], sprint: 2 },
  { key: 'schedule', icon: '📅', path: '/schedule', roles: [ADMIN, TECHNICIAN, RECEPTIONIST], sprint: 3 },
  { key: 'catalog', icon: '🧪', path: '/catalog', roles: [ADMIN, TECHNICIAN], sprint: 4 },
  { key: 'orders', icon: '📋', path: '/orders', roles: ALL, sprint: 5 },
  { key: 'results', icon: '🔬', path: '/results', roles: [ADMIN, TECHNICIAN, DOCTOR], sprint: 6 },
  { key: 'reports', icon: '📄', path: '/reports', roles: ALL, sprint: 7 },
  { key: 'billing', icon: '💰', path: '/billing', roles: [ADMIN, RECEPTIONIST], sprint: 8 },
]
