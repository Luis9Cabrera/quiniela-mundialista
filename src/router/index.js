import { createRouter, createWebHashHistory } from 'vue-router'
import { getCurrentUser } from 'vuefire'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: { public: true }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/quiniela/create',
    name: 'create-quiniela',
    component: () => import('../views/CreateQuinielaView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/quiniela/:id',
    name: 'quiniela-detail',
    component: () => import('../views/QuinielaDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/quiniela/:id/predict',
    name: 'predict',
    component: () => import('../views/PredictView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/quiniela/:id/leaderboard',
    name: 'leaderboard',
    component: () => import('../views/LeaderboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/quiniela/:id/admin',
    name: 'admin',
    component: () => import('../views/AdminView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// Navigation Guard
router.beforeEach(async (to, from, next) => {
  const currentUser = await getCurrentUser()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const guestOnly = to.matched.some(record => record.meta.guestOnly)

  if (requiresAuth && !currentUser) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (guestOnly && currentUser) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
