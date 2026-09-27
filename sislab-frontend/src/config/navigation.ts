import { UserRole } from '@/types'

const ALL = Object.values(UserRole)
const { ADMIN, TECNICO, MEDICO, RECEPCIONISTA } = UserRole

export interface NavItem {
  label: string
  icon: string
  path: string
  roles: UserRole[]
  sprint: number
}

/**
 * Fuente única de verdad del menú Y de los permisos de ruta:
 * el router usa `roles` para bloquear el acceso directo por URL.
 */
export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: '📊', path: '/dashboard', roles: ALL, sprint: 10 },
  { label: 'Pacientes', icon: '👥', path: '/pacientes', roles: [ADMIN, MEDICO, RECEPCIONISTA], sprint: 2 },
  { label: 'Médicos', icon: '🩺', path: '/medicos', roles: [ADMIN, RECEPCIONISTA], sprint: 2 },
  { label: 'Agenda', icon: '📅', path: '/agenda', roles: [ADMIN, TECNICO, RECEPCIONISTA], sprint: 3 },
  { label: 'Catálogo', icon: '🧪', path: '/catalogo', roles: [ADMIN, TECNICO], sprint: 4 },
  { label: 'Órdenes', icon: '📋', path: '/ordenes', roles: ALL, sprint: 5 },
  { label: 'Resultados', icon: '🔬', path: '/resultados', roles: [ADMIN, TECNICO, MEDICO], sprint: 6 },
  { label: 'Informes', icon: '📄', path: '/informes', roles: ALL, sprint: 7 },
  { label: 'Facturación', icon: '💰', path: '/facturacion', roles: [ADMIN, RECEPCIONISTA], sprint: 8 },
]
