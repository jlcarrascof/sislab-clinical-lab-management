// `as const` object instead of `enum`: tsconfig enables erasableSyntaxOnly
export const UserRole = {
  ADMIN: 'ADMIN',
  TECHNICIAN: 'TECHNICIAN',
  DOCTOR: 'DOCTOR',
  RECEPTIONIST: 'RECEPTIONIST',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export interface User {
  id: string
  email: string
  role: UserRole
  first_name: string
  last_name: string
  full_name: string
  last_login_at: string | null
}

export interface Tenant {
  id: string
  name: string
  slug: string
  plan: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  user: User
  tenant: Tenant
}

export interface RefreshResponse {
  access_token: string
  refresh_token: string
}
