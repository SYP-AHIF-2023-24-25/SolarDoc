<script setup lang="ts">
import type { EditorChannel } from '@/services/phoenix/editor-channel'
import { getHumanReadableTimeInfo } from '@/scripts/format-date'
import { useChannelViewStore } from '@/stores/channel-view'

const props = defineProps<{
  channel: EditorChannel
}>()

const channelViewStore = useChannelViewStore()

function handleJoinChannel() {
  channelViewStore.setCurrentChannel(props.channel)
}
</script>

<template>
  <div id="channel-view-element-wrapper">
    <span id="list-icon">~</span>
    <div id="channel-view-element-info">
      <h2 id="channel-info-title">
        <code>{{ channel.name }}</code><span>·</span><code class="small">{{ channel.id }}</code>
      </h2>
      <div id="channel-info-description">
        <p>
          <span>Creator:</span> {{ channel.creator.username }} (<code id="creator-id">{{
            channel.creator.id
          }}</code
          >)
        </p>
        <p><span>Description:</span> {{ channel.description }}</p>
        <p><span>Active since:</span> {{ getHumanReadableTimeInfo(channel.active_since) }}</p>
      </div>
    </div>
    <div id="channel-view-element-interaction">
      <button class="highlighted-button" @click="handleJoinChannel()">Join</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/var' as var;
@use '@/assets/core/mixins/align-horizontal-center' as *;

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
      @include align-horizontal-center;
      margin-bottom: 0.5rem;

      span {
        padding-top: 1px;
      }

      code.small {
        padding-top: 1px;
        font-size: 0.8rem;
      }
    }

    #channel-info-description {
      margin-left: 0.5rem;

      #creator-id {
        padding: 0;
        margin: 0;
      }
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
