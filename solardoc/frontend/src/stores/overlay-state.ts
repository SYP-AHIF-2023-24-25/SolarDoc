import {defineStore} from 'pinia'

export const useOverlayStateStore = defineStore('fullScreenPreview', {
  state: () => {
    return {
      fullScreenPreview: false,
      channelView: false,
      createShareUrl: false,
    }
  },
  actions: {
    setFullScreenPreview(fullScreenPreview: boolean) {
      this.resetAll()
      this.fullScreenPreview = fullScreenPreview
    },
    setChannelView(channelView: boolean) {
      this.resetAll()
      this.channelView = channelView
    },
    setShareUrlView(createShareUrl: boolean) {
      this.resetAll()
      this.createShareUrl = createShareUrl
    },
    resetAll() {
      this.channelView = false
      this.createShareUrl = false
      this.fullScreenPreview = false
    },
  },
})
