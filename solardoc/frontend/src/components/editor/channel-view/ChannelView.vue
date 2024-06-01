<script lang="ts" setup>
import {useOverlayStateStore} from '@/stores/overlay-state'
import {useChannelViewStore} from '@/stores/channel-view'
import {useCurrentUserStore} from '@/stores/current-user'
import CloseButtonSVG from '@/components/icons/CloseButtonSVG.vue'
import ChannelViewElement from '@/components/editor/channel-view/ChannelViewElement.vue'
import ChannelViewJoinConfirm from '@/components/editor/channel-view/ChannelViewJoinConfirm.vue'
import ChannelViewCurrent from '@/components/editor/channel-view/ChannelViewCurrent.vue'
import SDRouterLink from '@/components/SDRouterLink.vue'
import ChannelViewCreate from '@/components/editor/channel-view/ChannelViewCreate.vue'
import {storeToRefs} from 'pinia'
import {ref, watch} from 'vue'
import {useCurrentFileStore} from '@/stores/current-file'
import {interceptErrors} from '@/errors/handler/error-handler'

const overlayStateStore = useOverlayStateStore()
const channelViewStore = useChannelViewStore()
const currentUserStore = useCurrentUserStore()
const currentFileStore = useCurrentFileStore()

const { creatingChannel, selectedChannel, channels } = storeToRefs(channelViewStore)

const loadingState = ref(false)

async function refreshChannels() {
  loadingState.value = true
  if (currentUserStore.loggedIn && currentUserStore.bearer) {
    await channelViewStore.fetchChannels(currentUserStore.bearer)
  } else {
    channelViewStore.clearChannels()
  }
  loadingState.value = false
}

if (currentUserStore.loggedIn) {
  // Fetch channels again when the user returns from one of the forms
  watch([selectedChannel, creatingChannel], async () => {
    if (!selectedChannel.value || !creatingChannel.value) {
      await interceptErrors(refreshChannels())
    }
  })
  interceptErrors(refreshChannels())
}
</script>

<template>
  <div
    v-if="overlayStateStore.channelView"
    id="full-screen-wrapper"
    class="page-content-wrapper blurred-background-full-screen-overlay"
  >
    <div id="channel-view" class="page-content-container large full-screen-overlay-content">
      <div id="channel-view-header">
        <button id="close-button" @click="overlayStateStore.setChannelView(false)">
          <CloseButtonSVG />
        </button>
        <h1>Channels</h1>
        <p id="experimental-tag">Experimental</p>
      </div>
      <div v-if="!currentUserStore.loggedIn" id="channel-view-not-logged-in">
        <p>
          You need to be logged in to view channels
          <SDRouterLink class="emphasised-link" to="/login">→ Log in!</SDRouterLink>
        </p>
      </div>
      <div v-else-if="creatingChannel" id="channel-create">
        <ChannelViewCreate />
      </div>
      <template v-else-if="!selectedChannel">
        <button
          id="create-button"
          v-tooltip="
            !currentFileStore.fileId
              ? 'You need to save the file before creating a channel'
              : undefined
          "
          :disabled="!currentFileStore.fileId"
          class="highlighted-button"
          @click="channelViewStore.setCreatingChannel(true)"
        >
          Create
        </button>
        <template v-if="channels.length > 0">
          <div id="channel-view-secondary-header">
            <h2>Public Channels</h2>
          </div>
          <div id="channel-view-list">
            <ChannelViewElement
              v-for="channel in channels"
              :key="channel.id"
              :channel="channel"
            ></ChannelViewElement>
          </div>
        </template>
        <div v-else-if="loadingState" id="loading-banner">
          <h2><span class="dot-dot-dot-flashing"></span></h2>
        </div>
        <p v-else id="channel-view-empty-msg">So empty! Maybe go ahead and create a channel?</p>
      </template>
      <div v-else-if="!channelViewStore.channelJoined" id="channel-view-confirm">
        <ChannelViewJoinConfirm :channel="selectedChannel" />
      </div>
      <div v-else id="channel-view-info">
        <ChannelViewCurrent :channel="selectedChannel" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/core/var' as var;
@use '@/assets/core/mixins/align-center' as *;
@use '@/assets/full-screen-overlay' as *;

#full-screen-wrapper {
  @include align-center;

  #experimental-tag {
    position: absolute;
    top: calc(0.5rem + 40px * 0.67 + 40px - 0.9rem);
    left: 12rem;
    font-size: 1rem;
    color: var.$scheme-space-gray;
    font-style: italic;
  }

  #channel-view {
    position: relative;
    flex: 0 1 auto;
    height: max-content;
    border-radius: 1rem;
    padding: 0.5rem 2rem;
    background-color: var.$overlay-background-color;
    box-shadow: 0 0 10px 0 var.$box-shadow-color;

    #channel-view-list {
      display: flex;
      flex-flow: column nowrap;
      margin: 0 0 1rem 0;
      padding: 0 1rem 0 0;
      gap: 1rem;

      // Make this list scrollable if it's too long
      height: calc(60vh - 2 * 0.5rem);
      overflow-y: auto;

      // Add a border to the top of the element if it's not the first one
      & > *:not(:first-child) {
        border-top: 1px solid #e0e0e0;
        padding-top: 1rem;
      }

      & > *:first-child {
        margin-top: 0.5rem;
      }
    }

    #loading-banner {
      @include align-center;

      margin: 2rem 0;
    }

    #channel-view-create,
    #channel-view-confirm,
    #channel-view-not-logged-in,
    #channel-view-empty-msg {
      margin-bottom: 1rem;
    }

    #channel-view-not-logged-in,
    #channel-view-empty-msg {
      @include align-center;
      width: 100%;
      height: 8rem;
      font-size: 1.4rem;
    }

    #create-button,
    #close-button {
      position: absolute;
      z-index: 101;
      margin: 0;
    }

    #create-button {
      top: calc(0.5rem + 40px * 0.67 + 9px);
      right: 6rem;
    }

    #close-button {
      right: 3rem;
      top: calc(0.5rem + 40px * 0.67 + 40px - 1.5rem - 4px);

      svg {
        width: 1.5rem;
        height: 1.5rem;
        fill: var.$text-color;
      }
    }
  }
}
</style>
