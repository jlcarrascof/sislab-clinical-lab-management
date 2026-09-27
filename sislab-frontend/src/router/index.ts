import { watch } from 'vue'
import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import { NAV_ITEMS } from '@/config/navigation'
import { i18n } from '@/i18n'
import { useAuthStore } from '@/stores/authStore'
import type { UserRole } from '@/types'

declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean
    roles?: UserRole[]
    /** i18n key for the page title */
    titleKey?: string
    sprint?: number
  }
}

// Modules from upcoming sprints: placeholder page with permissions already enforced
const upcomingRoutes = NAV_ITEMS.filter((item) => item.path !== '/dashboard').map((item) => ({
  path: item.path.slice(1),
  component: () => import('@/views/ComingSoonView.vue'),
  meta: { roles: item.roles, titleKey: `nav.${item.key}`, sprint: item.sprint },
}))

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true, titleKey: 'login.title' },
    },
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      children: [
        { path: '', redirect: '/dashboard' },
        {
          path: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
          meta: { titleKey: 'nav.dashboard' },
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
  // Role without permission (e.g. a technician typing /billing in the address bar)
  if (to.meta.roles && auth.user && !to.meta.roles.includes(auth.user.role)) {
    return '/dashboard'
  }
  return true
})

function updateTitle(route: RouteLocationNormalized) {
  const { t } = i18n.global
  document.title = route.meta.titleKey ? `${t(route.meta.titleKey)} · SisLab` : 'SisLab'
}

router.afterEach(updateTitle)
// Keep the tab title in sync when the language changes
watch(i18n.global.locale, () => updateTitle(router.currentRoute.value))

export default router
