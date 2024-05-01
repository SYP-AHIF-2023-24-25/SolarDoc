import { type Router } from 'vue-router'
import { useCurrentUserStore } from '@/stores/current-user'
import { NotLoggedInWarn } from '@/errors/not-logged-in-warn'

const currentUserStore = useCurrentUserStore()

/**
 * Throws an error in case the user is not logged in. The error will be shown as a warning notification, but internally
 * treated as an abort error.
 * @since 0.6.0
 */
export async function ensureLoggedIn($router: Router): Promise<void> {
  if (!currentUserStore.bearer) {
    await $router.push('/login')
    throw new NotLoggedInWarn()
  }
}
