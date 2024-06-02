<script setup lang="ts">
import { useOverlayStateStore } from '@/stores/overlay-state'
import { useChannelViewStore } from '@/stores/channel-view'
import { useCurrentUserStore } from '@/stores/current-user'
import CloseButtonSVG from '@/components/icons/CloseButtonSVG.vue'
import SDRouterLink from '@/components/SDRouterLink.vue'
import CurrentChannel from "@/components/editor/dropdown/current-channel/CurrentChannel.vue"
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'
import { interceptErrors } from '@/errors/handler/error-handler'

const overlayStateStore = useOverlayStateStore()
const currentChannelStore = useChannelViewStore()
const currentUserStore = useCurrentUserStore()

const { creatingChannel, selectedChannel, channels } = storeToRefs(currentChannelStore)

const loadingState = ref(false)

async function refreshChannels() {
  loadingState.value = true
  if (currentUserStore.loggedIn && currentUserStore.bearer) {
    await currentChannelStore.fetchChannels(currentUserStore.bearer)
  } else {
    currentChannelStore.clearChannels()
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
    id="full-screen-wrapper"
    class="page-content-wrapper blurred-background-full-screen-overlay"
    v-if="overlayStateStore.currentChannel"
  >
    <div id="channel-view" class="page-content-container large full-screen-overlay-content">
      <div id="channel-view-header">
        <button id="close-button" @click="overlayStateStore.setCurrentChannel(false)">
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
      <div id="channel-view-info" v-else-if="selectedChannel">
        <CurrentChannel :channel="selectedChannel" />
      </div>
      <div id="channel-missing-error" v-else>
        <p>Channel not found. Please reload the page and if the error persists, logout and login again!</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
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

    #channel-view-not-logged-in,
    #channel-view-empty-msg,
    #channel-missing-error {
      @include align-center;
      margin-bottom: 1rem;
      width: 100%;
      height: 8rem;
      font-size: 1.4rem;
    }

    #close-button {
      position: absolute;
      z-index: 101;
      margin: 0;
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
