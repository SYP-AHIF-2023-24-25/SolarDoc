import {defineStore} from 'pinia'

/**
 * The init store is used to indicate that the app has finished loading, but the editor content has not yet been changed.
 */
export const useInitStateStore = defineStore('init', {
  state: () => {
    return { init: true }
  },
  actions: {
    setFalse() {
      this.init = false
    },
  },
})
