import { createRouter, createWebHistory } from 'vue-router'
import { NAV_ITEMS } from '@/config/navigation'
import { useAuthStore } from '@/stores/authStore'
import type { UserRole } from '@/types'

declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean
    roles?: UserRole[]
    title?: string
    sprint?: number
  }
}

// Módulos de sprints futuros: placeholder con los permisos ya aplicados
const upcomingRoutes = NAV_ITEMS.filter((item) => item.path !== '/dashboard').map((item) => ({
  path: item.path.slice(1),
  component: () => import('@/views/ComingSoonView.vue'),
  meta: { roles: item.roles, title: item.label, sprint: item.sprint },
}))

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true, title: 'Iniciar sesión' },
    },
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      children: [
        { path: '', redirect: '/dashboard' },
        {
          path: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
          meta: { title: 'Dashboard' },
        },
        ...upcomingRoutes,
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.public) {
    return auth.isAuthenticated && to.path === '/login' ? '/dashboard' : true
  }
  if (!auth.isAuthenticated) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  // Rol sin permiso (p.ej. un TECNICO escribiendo /facturacion en la URL)
  if (to.meta.roles && auth.user && !to.meta.roles.includes(auth.user.role)) {
    return '/dashboard'
  }
  return true
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · SisLab` : 'SisLab'
})

export default router
