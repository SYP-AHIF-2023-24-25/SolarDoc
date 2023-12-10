import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useLoadingStore } from '@/stores/loading'

const htmlExtMatcher = ':htmlExt(.html)?'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/index' + htmlExtMatcher,
      name: 'index',
      redirect: '/'
    },
    {
      path: '/about' + htmlExtMatcher,
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('@/views/AboutView.vue'),
    },
    {
      path: '/docs' + htmlExtMatcher,
      name: 'docs',
      component: () => import('@/views/DocsView.vue'),
    },
    {
      path: '/editor'+ htmlExtMatcher,
      name: 'editor',
      component: () => import('@/views/EditorView.vue'),
    },
    {
      path: '/test-editor' + htmlExtMatcher,
      name: 'test-editor',
      component: () => import('@/views/TestEditorView.vue'),
    },
    // 404-page (reroutes in the view to the static 404.html)
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
})

// Add spinner when navigating between routes (spinner may already be active, but that doesn't matter, as we just need
// to make sure it stops spinning when the new route is loaded)
router.beforeResolve((to, from, next) => {
  if (to.name) {
    const loadingStore = useLoadingStore()
    loadingStore.setLoading(true)
  }
  next()
})

router.afterEach(() => {
  const loadingStore = useLoadingStore()
  loadingStore.setLoading(false)
})

export default router
