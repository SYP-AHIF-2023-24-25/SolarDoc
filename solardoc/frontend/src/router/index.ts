import {
  createRouter,
  createWebHistory,
  type NavigationFailure,
  type RouteLocationNormalized,
} from 'vue-router'
import { useLoadingStore } from '@/stores/loading'
import { useNotification } from '@kyvg/vue3-notification'
import HomeView from '../views/HomeView.vue'
import {useCurrentFileStore} from "@/stores/current-file";

const { notify } = useNotification()

const currentFileStore = useCurrentFileStore()

const htmlExtMatcher = ':htmlExt(.html)?'
const router = createRouter({
  // We use for all routes except the main page, route level code-splitting with 'import()' to generate separate chunks.
  // This generates a separate chunk (CollabView.[hash].js) for this route, which is lazy-loaded when the route is
  // visited.
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: 'Welcome to SolarDoc',
      }
    },
    {
      path: '/index' + htmlExtMatcher,
      name: 'index',
      redirect: '/',
    },
    {
      path: '/collab' + htmlExtMatcher,
      name: 'collab',
      component: () => import('@/views/CollabView.vue'),
      meta: {
        title: 'Collab',
      }
    },
    {
      path: '/login' + htmlExtMatcher,
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: {
        title: 'Login',
      }
    },
    {
      path: '/signup' + htmlExtMatcher,
      name: 'signup',
      component: () => import('@/views/SignupView.vue'),
      meta: {
        title: 'Sign Up',
      }
    },
    {
      path: '/reset-password' + htmlExtMatcher,
      name: 'reset-password',
      component: () => import('@/views/ResetPasswordView.vue'),
      meta: {
        title: 'Reset Password',
      }
    },
    {
      path: '/profile' + htmlExtMatcher,
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: {
        title: 'Profile',
      }
    },
    {
      path: '/test-editor' + htmlExtMatcher,
      name: 'test-editor',
      component: () => import('@/views/TestEditorView.vue'),
      meta: {
        title: 'Editor',
      }
    },
    {
      path: '/editor',
      children: [
        {
          path: '',
          redirect: { name: 'local-editor' },
        },
        {
          name: 'local-editor',
          path: 'local',
          component: () => import('@/views/EditorView.vue'),
          sensitive: true,
          strict: true,
          meta: {
            title: 'Editor',
          }
        },
        {
          name: 'remote-editor',
          path: 'o/:fileId',
          component: () => import('@/views/EditorView.vue'),
          sensitive: true,
          strict: true,
          meta: {
            title: 'Editor',
          }
        },
        {
          name: 'shared-editor',
          path: 'shared/:fileId',
          component: () => import('@/views/EditorView.vue'),
          sensitive: true,
          strict: true,
          meta: {
            title: 'Editor',
          }
        },
      ],
    },
    // ---- DEPRECATED ----
    {
      path: '/share/:shareUrlId',
      name: 'share-url',
      component: () => import('@/views/ShareURLView.vue'),
    },
    // ---------------------
    // 404-page (reroutes in the view to the static 404.html)
    {
      path: '/404',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: {
        title: '404 ・ Not Found',
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'fallback-not-found',
      redirect: { name: 'not-found' },
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

  // Ensure all notifications are closed
  notify({ clean: true })

  next()
})

router.afterEach(() => {
  const loadingStore = useLoadingStore()
  loadingStore.setLoading(false)
})

router.beforeEach((to, from) => {
  const titleFromParams = to.params?.pageTitle

  let title = 'Solardoc'
  if (titleFromParams) {
    title = `${titleFromParams} - ${title}`
  } else if (to.meta?.title) {
    title = `${to.meta?.title} - ${title}`
  }
  document.title = title;
})

function reportRouterFailure(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  failure: NavigationFailure,
) {
  console.warn(`Failed to navigate from ${from.fullPath} to ${to.fullPath}:`, failure)
}

router.afterEach((to, from, failure) => {
  if (failure) {
    reportRouterFailure(to, from, failure)
  }
})

router.afterEach((to, from) => {
  const titleFromParams = to.params?.pageTitle
  if (String(to.name).includes('editor')) {
    document.title = `${currentFileStore.file.file_name} ・ ${titleFromParams} - Solardoc`
  }
})

export default router
