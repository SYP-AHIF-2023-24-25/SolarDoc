import { defineStore } from 'pinia'

export const useFullScreenPreviewStore = defineStore('fullScreenPreview', {
  state: () => {
    return { fullScreenPreview: false }
  },
  actions: {
    setFullScreenPreview(fullScreenPreview: boolean) {
      this.fullScreenPreview = fullScreenPreview
    },
  },
})
