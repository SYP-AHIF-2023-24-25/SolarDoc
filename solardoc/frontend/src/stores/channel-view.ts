import type { EditorChannel } from '@/services/phoenix/editor-channel'
import * as phoenixRestService from '@/services/phoenix/api-service'
import constants from '@/plugins/constants'
import { defineStore } from 'pinia'
import { PhoenixInternalError, PhoenixRestError } from '@/services/phoenix/errors'

export const useChannelViewStore = defineStore('channels', {
  state: () => {
    // To not let the user wait before showing anything, we will store all the channels in the store and session storage
    // This way, we can show the user the channels that are already in the session storage, and then update them with
    // the latest channels from the server
    let channels: Array<EditorChannel> | undefined
    try {
      const storedChannels = JSON.parse(
        <string>sessionStorage.getItem(constants.sessionStorageChannelKey),
      )
      if (Array.isArray(storedChannels)) {
        channels = storedChannels
      }
    } catch (e) {
      /* empty */
    }

    return {
      creatingChannel: <boolean>false,
      currentChannel: <EditorChannel | undefined>undefined,
      channelJoined: <boolean>false,
      channels: <Array<EditorChannel>>channels ?? [],
    }
  },
  actions: {
    async fetchChannels(bearer: string) {
      let resp: Awaited<ReturnType<typeof phoenixRestService.getV1EditorChannels>>
      try {
        resp = await phoenixRestService.getV1EditorChannels(bearer)
      } catch (e) {
        throw new PhoenixInternalError(
          'Critically failed to fetch current user. Cause: ' + (<Error>e).message,
        )
      }
      if (resp.status === 200) {
        this.setChannels(resp.data)
      } else if (resp.status === 401) {
        throw new PhoenixRestError(
          'Server rejected request to fetch current user. Cause: Unauthorized',
          resp.status,
        )
      }
    },
    setCurrentChannel(channel: EditorChannel) {
      this.currentChannel = channel
    },
    unsetCurrentChannel() {
      this.currentChannel = undefined
    },
    setChannels(channels: Array<EditorChannel>) {
      this.channels = channels
      sessionStorage.setItem(constants.sessionStorageChannelKey, JSON.stringify(channels))
    },
    clearChannels() {
      this.channels = []
      sessionStorage.removeItem(constants.sessionStorageChannelKey)
    },
    setChannelJoined(channelJoined: boolean) {
      this.channelJoined = channelJoined
    },
    setCreatingChannel(creatingChannel: boolean) {
      this.creatingChannel = creatingChannel
    },
  },
})
