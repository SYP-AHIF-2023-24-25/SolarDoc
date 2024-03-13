<script setup lang="ts">
import type { EditorChannel } from '@/services/phoenix/editorChannel'
import { getHumanReadableTimeInfo } from '@/scripts/format-date'
import { useChannelsStore } from '@/stores/channels'

const props = defineProps<{
  channelInfo: EditorChannel
}>()

const channelStore = useChannelsStore()

function handleJoinChannel() {
  channelStore.setCurrentChannel(props.channelInfo)
}
</script>

<template>
  <div id="channel-view-element-wrapper">
    <span id="list-icon">~</span>
    <div id="channel-view-element-info">
      <h2 id="channel-info-title">
        <code>{{ channelInfo.id }}</code
        >- {{ channelInfo.name }}
      </h2>
      <div id="channel-info-description">
        <p><span>Creator:</span> {{ channelInfo.creator }}</p>
        <p><span>Active since:</span> {{ getHumanReadableTimeInfo(channelInfo.activeSince) }}</p>
        <p><span>Description:</span> {{ channelInfo.description }}</p>
      </div>
    </div>
    <div id="channel-view-element-interaction">
      <button class="highlighted-button" @click="handleJoinChannel()">Join</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/var' as var;

#channel-view-element-wrapper {
  // Align content in the center on the x-axis
  display: flex;
  position: unset;
  flex: 0 0 auto;
  flex-flow: row nowrap;

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
