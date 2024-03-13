import { defineStore } from 'pinia'
import type { EditorChannel } from '@/services/phoenix/editorChannel'

export const useChannelsStore = defineStore('channels', {
  state: () => {
    return { currentChannel: <EditorChannel | undefined>undefined }
  },
  actions: {
    setCurrentChannel(channel: EditorChannel) {
      this.currentChannel = channel
    },
    unsetCurrentChannel() {
      this.currentChannel = undefined
    },
  },
})
