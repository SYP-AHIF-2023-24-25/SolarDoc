import {defineStore} from 'pinia'

export const usePreviewSelectedSlideStore = defineStore('previewSelectedSlide', {
  state: () => {
    return { slideIndex: 0, subSlideIndex: <number | undefined>undefined }
  },
  actions: {
    setSlide(slideIndex: number, subSlideIndex?: number) {
      this.slideIndex = slideIndex
      this.subSlideIndex = subSlideIndex
    },
  },
})
