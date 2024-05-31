import {defineStore} from 'pinia'

export const usePreviewMenuSlideStateStore = defineStore('previewMenuSlideState', {
  state: () => {
    return { x: 0 }
  },
  actions: {
    setX(x: number) {
      this.x = x
    },
  },
})
