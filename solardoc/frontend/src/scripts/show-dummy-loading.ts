import {useLoadingStore} from "@/stores/loading";

const loadingStore = useLoadingStore()

/**
 * Triggers a 'dummy' loading spinner, which is just intended to show the user that something has happened.
 *
 * This will per default be stopped after 750ms.
 */
export function showDummyLoading(timeout: number = 750): ReturnType<typeof setTimeout> {
  loadingStore.setLoading(true)
  return setTimeout(() => {
    loadingStore.setLoading(false)
  }, timeout)
}
