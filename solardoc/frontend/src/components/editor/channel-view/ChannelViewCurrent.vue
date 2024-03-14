<script setup lang="ts">
import { getHumanReadableTimeInfo } from '@/scripts/format-date'
import type { EditorChannel } from '@/services/phoenix/editor-channel'
import {useWSClientStore} from "@/stores/ws-client";
import {storeToRefs} from "pinia";

defineProps<{
  channel: EditorChannel
}>()

const wsClientStore = useWSClientStore()
const { wsClient } = storeToRefs(wsClientStore)

function handleLeaveChannel() {
  console.log('Leave channel')
}
</script>

<template>
  <div id="channel-view-element-wrapper">
    <div id="channel-view-element-info">
      <h2 id="channel-info-title">
        <code>{{ channel.name }}</code><span>·</span><code class="small">{{ channel.id }}</code>
      </h2>
      <div id="channel-info-state">
        <span class="joining" v-if="wsClient?.currentChannelState === 'joining'">·Joining</span>
        <span class="leaving" v-else-if="wsClient?.currentChannelState === 'leaving'">· Leaving</span>
        <span class="errored" v-else-if="wsClient?.currentChannelState === 'errored'">! Errored</span>
        <span class="closed" v-else-if="wsClient?.currentChannelState === 'closed'">x Closed</span>
        <span class="healthy" v-else-if="wsClient?.currentChannelState === 'joined'">· Healthy</span>
        <span class="unknown" v-else>Unknown</span>
      </div>
      <div id="channel-info-description">
        <p><span>Creator:</span> {{ channel.creator.username }}</p>
        <p><span>Active since:</span> {{ getHumanReadableTimeInfo(channel.active_since) }}</p>
        <p><span>Description:</span> {{ channel.description }}</p>
        <p><span>Active Users:</span> NaN</p>
        <p></p>
      </div>
    </div>
    <div id="channel-view-element-interaction">
      <button class="highlighted-button" @click="handleLeaveChannel()">Leave</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/var' as var;

#channel-view-element-wrapper {
  // Align content in the center on the x-axis
  display: flex;
  flex: 0 1 auto;
  flex-flow: row nowrap;
  min-height: 15rem;

  width: 100%;
  height: 100px;

  #list-icon {
    margin-right: 0.5rem;
    font-size: 2.5rem;
    line-height: 1;
    color: var.$scheme-purple;
  }

  #channel-view-element-info {
    display: flex;
    flex: 0 0 auto;
    flex-grow: 1;
    flex-direction: column;

    #channel-info-title {
      margin-bottom: 0.5rem;
    }

    #channel-info-state {
      display: flex;
      span {
        font-style: italic;
        padding: 0.5rem;
      }
    }

    #channel-info-description {
      margin-left: 0.5rem;
    }

    code {
      padding: 0 0.25rem;
    }

    span {
      font-weight: bold;
    }
  }

  #channel-view-element-interaction {
    padding-right: 1rem;
  }
}
</style>
