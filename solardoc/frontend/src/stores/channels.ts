import { defineStore } from 'pinia'
import type {Channel} from "@/services/phoenix/channel";

export const useChannelsStore = defineStore('channels', {
  state: () => {
    return { currentChannel: <Channel | undefined>undefined }
  },
  actions: {
    setCurrentChannel(channel: Channel) {
      this.currentChannel = channel
    },
    unsetCurrentChannel() {
      this.currentChannel = undefined
    }
  },
})
