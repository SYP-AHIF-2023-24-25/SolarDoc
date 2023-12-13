import {defineStore} from "pinia";

export const usePreviewLoadingStore = defineStore('previewLoading', {
  state: () => {
    return { previewLoading: false }
  },
  actions: {
    setPreviewLoading(previewLoading: boolean) {
      this.previewLoading = previewLoading
    },
  },
})
