import type { Router } from 'vue-router'
import { useLoadingStore } from '@/stores/loading'

const loadingStore = useLoadingStore()

/**
 * Throws a 404 error by redirecting the user to the 404 page.
 * @param $router The router object.
 */
export function throw404Error($router: Router): Promise<any> {
  loadingStore.setLoading(false)
  return $router.push('/404')
}
