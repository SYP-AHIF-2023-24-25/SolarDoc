import {defineStore} from "pinia";

export const usePreviewURLStore = defineStore('previewURL', {
  state: () => {
    return { previewURL: <string | undefined>undefined }
  },
  actions: {
    setPreviewURL(previewURL: string) {
      this.previewURL = previewURL
    },
  },
})
