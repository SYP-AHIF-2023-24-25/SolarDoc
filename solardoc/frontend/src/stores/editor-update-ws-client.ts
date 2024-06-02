import { defineStore } from 'pinia'
import { SDSClient } from '@/services/phoenix/ws-client'

export const useEditorUpdateWSClient = defineStore('editorUpdateWSClient', {
  state: () => {
    return {
      wsClient: null as null | SDSClient,
    }
  },
  getters: {
    hasActiveChannelConnection(): boolean {
      return this.wsClient?.channelHealthy ?? false
    },
  },
  actions: {
    createWSClient(url: string, userToken?: string) {
      return (this.wsClient = new SDSClient(url, userToken))
    },
    disconnectWSClient() {
      if (this.wsClient) {
        this.wsClient.disconnect()
        this.wsClient = null
      }
    },
  },
})
