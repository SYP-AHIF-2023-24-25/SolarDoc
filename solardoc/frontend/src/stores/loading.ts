import { defineStore } from 'pinia'

export const useLoadingStore = defineStore('loading', {
  state: () => {
    return {
      loading: false,
      lockCounter: 0,
      displayMessages: <Array<string>>[],
    }
  },
  getters: {
    currMsg(): string | undefined {
      return this.displayMessages[this.displayMessages.length - 1] ?? undefined
    },
  },
  actions: {
    lockLoading() {
      this.lockCounter++
      this.setLoading(true)
    },
    unlockLoading() {
      if (this.lockCounter > 0) {
        this.lockCounter--
      }
      if (this.lockCounter === 0) {
        this.setLoading(false)
      }
    },
    setLoading(loading: boolean) {
      if (!loading) {
        setTimeout(() => {
          if (this.lockCounter === 0) {
            this.loading = loading
          }
        }, 200)
      } else {
        this.loading = loading
      }
    },
    pushMsg(msg: string) {
      this.displayMessages.push(msg)
    },
    popMsg(msg: string) {
      const index = this.displayMessages.indexOf(msg)
      if (index !== -1) {
        this.displayMessages.splice(index, 1)
      }
    },
  },
})
