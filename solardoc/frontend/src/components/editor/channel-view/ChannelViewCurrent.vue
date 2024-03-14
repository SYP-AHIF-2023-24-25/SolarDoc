<script setup lang="ts">
import {getHumanReadableTimeInfo} from "@/scripts/format-date";
import type {EditorChannel} from "@/services/phoenix/editor-channel";

defineProps<{
  channel: EditorChannel
}>()

function handleLeaveChannel() {
  console.log('Leave channel')
}
</script>

<template>
  <div id="channel-view-element-wrapper">
    <span id="list-icon">~</span>
    <div id="channel-view-element-info">
      <h2 id="channel-info-title">
        <code>{{ channel.id }}</code
        >- {{ channel.id }}
      </h2>
      <div id="channel-info-description">
        <p><span>Creator:</span> {{ channel.creator }}</p>
        <p><span>Active since:</span> {{ getHumanReadableTimeInfo(channel.active_since) }}</p>
        <p><span>Description:</span> {{ channel.description }}</p>
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
