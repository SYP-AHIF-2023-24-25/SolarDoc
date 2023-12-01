import { defineStore } from 'pinia'

export const useLoadingStore = defineStore('loading', {
  state: () => {
    return {loading: false};
  },
  actions: {
    setLoading(loading: boolean) {
      if (!loading) {
        console.log("loading: " + loading);
        setTimeout(() => {
          this.loading = loading;
        }, 200);
      } else {
        this.loading = loading;
        console.log("loading: " + loading);
      }
    },
  },
})
