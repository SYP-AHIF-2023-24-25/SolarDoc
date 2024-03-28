import { defineStore } from 'pinia'

export const useOverlayStateStore = defineStore('fullScreenPreview', {
  state: () => {
    return {
      fullScreenPreview: false,
      channelView: false,
    }
  },
  actions: {
    setFullScreenPreview(fullScreenPreview: boolean) {
      this.fullScreenPreview = fullScreenPreview
    },
    setChannelView(channelView: boolean) {
      this.channelView = channelView
    },
  },
})
