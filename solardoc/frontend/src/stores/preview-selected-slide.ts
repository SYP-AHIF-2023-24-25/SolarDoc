import { defineStore } from 'pinia'
import { SolardocEditor } from '@/scripts/editor/editor'

export const usePreviewSelectedSlideStore = defineStore('previewSelectedSlide', {
  state: () => {
    return { slideIndex: 0, subSlideIndex: <number | undefined>undefined }
  },
  actions: {
    setSlide(slideIndex: number, redirectCursor: boolean, subSlideIndex?: number) {
      this.slideIndex = slideIndex
      this.subSlideIndex = subSlideIndex

      if (redirectCursor) {
        SolardocEditor.redirectCursorToArea()
      }
    },
  },
})
