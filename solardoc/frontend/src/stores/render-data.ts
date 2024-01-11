import {defineStore} from "pinia";
import type {RenderedPresentation} from "@/scripts/handle-render";

export const useRenderDataStore = defineStore('renderData', {
  state: () => {
    return <Partial<RenderedPresentation>>{
      rawSize: undefined,
      slideCount: undefined,
      slideCountInclSubslides: undefined,
      previewURL: undefined,
    }
  },
  actions: {
    setRenderData(renderData: RenderedPresentation) {
      this.rawSize = renderData.rawSize
      this.slideCount = renderData.slideCount
      this.slideCountInclSubslides = renderData.slideCountInclSubslides
      this.previewURL = renderData.previewURL
    },
  },
})
