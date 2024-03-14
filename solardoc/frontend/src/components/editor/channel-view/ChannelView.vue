<script setup lang="ts">
import { useOverlayStateStore } from '@/stores/overlay-state'
import { useChannelsStore } from '@/stores/channels'
import { useCurrentUserStore } from '@/stores/current-user'
import CloseButtonSVG from '@/components/icons/CloseButtonSVG.vue'
import ChannelViewElement from '@/components/editor/channel-view/ChannelViewElement.vue'
import ChannelViewJoinConfirm from '@/components/editor/channel-view/ChannelViewJoinConfirm.vue'
import ChannelViewCurrent from '@/components/editor/channel-view/ChannelViewCurrent.vue'
import SDRouterLink from '@/components/SDRouterLink.vue'
import ChannelViewCreate from '@/components/editor/channel-view/ChannelViewCreate.vue'

const overlayStateStore = useOverlayStateStore()
const channelStore = useChannelsStore()
const currentUserStore = useCurrentUserStore()

if (currentUserStore.loggedIn && currentUserStore.bearer) {
  channelStore.fetchChannels(currentUserStore.bearer)
}
</script>

<template>
  <div id="full-screen-wrapper" class="full-screen" v-if="overlayStateStore.channelView">
    <div id="channel-view">
      <div id="channel-view-header">
        <button id="close-button" @click="overlayStateStore.setChannelView(false)">
          <CloseButtonSVG />
        </button>
        <h1>Channels</h1>
        <p id="experimental-tag">Experimental</p>
      </div>
      <div id="channel-view-not-logged-in" v-if="!currentUserStore.loggedIn">
        <p>
          You need to be logged in to view channels
          <SDRouterLink class="emphasised-link" to="/login">→ Log in!</SDRouterLink>
        </p>
      </div>
      <div id="channel-create" v-else-if="channelStore.creatingChannel">
        <ChannelViewCreate />
      </div>
      <template v-else-if="!channelStore.currentChannel">
        <button
          id="create-button"
          class="highlighted-button"
          @click="channelStore.setCreatingChannel(true)"
        >
          Create
        </button>
        <div id="channel-view-list">
          <ChannelViewElement
            v-for="channel in channelStore.channels"
            :key="channel.id"
            :channel="channel"
          ></ChannelViewElement>
        </div>
      </template>
      <div id="channel-view-confirm" v-else-if="!channelStore.channelJoined">
        <ChannelViewJoinConfirm />
      </div>
      <div id="channel-view-info" v-else>
        <ChannelViewCurrent :channel="channelStore.currentChannel" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/var' as var;
@use '@/assets/core/mixins/align-center' as *;

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
    width: 50vw;
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
        margin-bottom: 1rem;
      }

      & > *:first-child {
        margin-top: 1rem;
      }
    }

    #channel-view-create,
    #channel-view-confirm,
    #channel-view-not-logged-in {
      margin-bottom: 1rem;
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
