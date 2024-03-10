<script setup lang="ts">
import type {Channel} from "@/services/phoenix/channel";
import { useOverlayStateStore } from '@/stores/overlay-state'
import {useChannelsStore} from "@/stores/channels";
import CloseButtonSVG from "@/components/icons/CloseButtonSVG.vue";
import ChannelViewElement from "@/components/channel-view/ChannelViewElement.vue";
import ChannelViewJoinConfirm from "@/components/channel-view/ChannelViewJoinConfirm.vue";

const overlayStateStore = useOverlayStateStore()
const channelStore = useChannelsStore();

// For testing
const channels: Array<Channel> = [
  {
    id: 1,
    name: "d9823js's Channel",
    description: "Hello this is the description!",
    activeSince: 1700000000000,
    creator: "d9823js"
  },
  {
    id: 2,
    name: "e2dcf1's Channel",
    description: "Hello this is the description!",
    activeSince: 1700000000000,
    creator: "e2dcf1"
  },
  {
    id: 3,
    name: "f3d4e5's Channel",
    description: "Hello this is the description!",
    activeSince: 1700000000000,
    creator: "f3d4e5"
  },
  {
    id: 4,
    name: "g6h7i8's Channel",
    description: "Hello this is the description!",
    activeSince: 1700000000000,
    creator: "g6h7i8"
  },
  {
    id: 5,
    name: "j9k10l's Channel",
    description: "Hello this is the description!",
    activeSince: 1700000000000,
    creator: "j9k10l"
  },
  {
    id: 6,
    name: "m11n12o's Channel",
    description: "Hello this is the description!",
    activeSince: 1700000000000,
    creator: "m11n12o"
  },
  {
    id: 7,
    name: "p13q14r's Channel",
    description: "Hello this is the description!",
    activeSince: 1700000000000,
    creator: "p13q14r"
  },
  {
    id: 8,
    name: "s15t16u's Channel",
    description: "Hello this is the description!",
    activeSince: 1700000000000,
    creator: "s15t16u"
  },
  {
    id: 9,
    name: "v17w18x's Channel",
    description: "Hello this is the description!",
    activeSince: 1700000000000,
    creator: "v17w18x"
  },
  {
    id: 10,
    name: "y19z20a's Channel",
    description: "Hello this is the description!",
    activeSince: 1700000000000,
    creator: "y19z20a"
  },
];
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
      <div id="channel-view-list" v-if="!channelStore.currentChannel">
        <ChannelViewElement
            v-for="channelView in channels"
            :key="channelView.id"
            :channel-info="channelView"
        ></ChannelViewElement>
      </div>
      <div id="channel-view-confirm" v-else>
        <ChannelViewJoinConfirm />
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

    #channel-view-confirm {
      margin-bottom: 1rem;
    }

    #close-button {
      position: absolute;
      top: calc(0.5rem + 40px * 0.67 + 40px - 1.5rem - 4px);
      right: 3rem;
      z-index: 101;

      svg {
        width: 1.5rem;
        height: 1.5rem;
        fill: var.$text-color;
      }
    }
  }
}
</style>
