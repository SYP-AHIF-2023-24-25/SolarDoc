import {defineStore} from 'pinia'
import constants from '@/plugins/constants'

export const useLastModifiedStore = defineStore('lastModified', {
  state: () => {
    let localStorageLastModified = localStorage.getItem(constants.localStorageLastModifiedKey)
    if (!localStorageLastModified) {
      localStorageLastModified = new Date().toISOString()
      localStorage.setItem(constants.localStorageLastModifiedKey, localStorageLastModified)
    }
    return {
      lastModified: new Date(localStorageLastModified),
    }
  },
  actions: {
    setLastModified(lastModified: Date) {
      this.lastModified = lastModified
      localStorage.setItem(constants.localStorageLastModifiedKey, lastModified.toISOString())
    },
  },
})
