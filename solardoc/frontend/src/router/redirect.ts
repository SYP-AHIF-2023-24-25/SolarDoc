import { isValidPath } from '@/scripts/is-valid-path'
import { useLoadingStore } from '@/stores/loading'
import type { Router } from 'vue-router'

const loadingStore = useLoadingStore()

/**
 * Redirects the user to the returnTo query parameter if it is a valid path, otherwise redirects to the default path.
 * @since 1.0.0
 */
export async function redirect($router: Router, defaultPath: string) {
  loadingStore.setLoading(true)

  const returnTo = $router.currentRoute.value.query.returnTo
  if (typeof returnTo === 'string' && isValidPath(returnTo)) {
    return $router.push(returnTo)
  } else {
    return $router.push(defaultPath)
  }
}
