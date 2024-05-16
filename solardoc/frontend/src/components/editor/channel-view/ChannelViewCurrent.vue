<script setup lang="ts">
import { getHumanReadableTimeInfo } from '@/scripts/format-date'
import type { EditorChannel } from '@/services/phoenix/editor-channel'
import { useEditorUpdateWSClient } from '@/stores/editor-update-ws-client'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useChannelViewStore } from '@/stores/channel-view'
import { interceptErrors } from '@/errors/error-handler'

const props = defineProps<{
  channel: EditorChannel
}>()

const editorUpdateWSClient = useEditorUpdateWSClient()
const channelViewStore = useChannelViewStore()

const channelDescription = ref(props.channel.description || '<None provided>')

const { wsClient } = storeToRefs(editorUpdateWSClient)
const loadingState = ref(false)

async function handleLeaveChannel() {
  loadingState.value = true
  console.log('[ChannelView] Leaving channel')
  await wsClient.value?.leaveChannel()
  setTimeout(() => {
    channelViewStore.unsetSelectedChannel()
    loadingState.value = false
  }, 250)
}

// Last modified is a ref which is updated every 0.5 second to show the last modified time
let lastModified = ref(getLastModified())
function getLastModified(): string {
  return getHumanReadableTimeInfo(props.channel.active_since)
}

const updateLastModified = () => (lastModified.value = getLastModified())
setInterval(updateLastModified, 500)
</script>

<template>
  <template v-if="!loadingState">
    <div id="current-channel-element-wrapper">
      <div id="current-channel-top-header">
        <h2>Current Channel</h2>
      </div>
      <div id="current-channel-element">
        <div id="channel-info-state">
          <div class="joining" v-if="wsClient?.currentChannelState === 'joining'">
            <span></span>
          </div>
          <div class="leaving" v-else-if="wsClient?.currentChannelState === 'leaving'">
            <span></span>
          </div>
          <div class="errored" v-else-if="wsClient?.currentChannelState === 'errored'">
            <span></span>
          </div>
          <div class="closed" v-else-if="wsClient?.currentChannelState === 'closed'">
            <span></span>
          </div>
          <div class="healthy" v-else-if="wsClient?.currentChannelState === 'joined'">
            <span></span>
          </div>
          <div class="unknown" v-else><span></span></div>
        </div>
        <div id="current-channel-element-info">
          <h2 id="channel-info-title">
            <code>{{ channel.name }}</code
            ><span>·</span><code class="small">{{ channel.id }}</code>
          </h2>
          <div id="channel-info-details">
            <p><span>Creator:</span> {{ channel.creator.username }}</p>
            <p><span>Active since:</span> {{ lastModified }}</p>
            <p><span>Active Users:</span> NaN</p>
            <p><span>Description:</span></p>
            <!-- eslint-disable-next-line vue/no-mutating-props -->
            <textarea disabled wrap="soft" v-model="channelDescription"></textarea>
          </div>
        </div>
        <div id="current-channel-element-interaction">
          <button class="highlighted-button" @click="interceptErrors(handleLeaveChannel())">
            Leave
          </button>
        </div>
      </div>
    </div>
  </template>
  <div v-else id="loading-banner">
    <div id="current-channel-element-wrapper" class="center-loading">
      <h2><span class="dot-dot-dot-flashing"></span></h2>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/var' as var;
@use '@/assets/core/mixins/align-center' as *;
@use '@/assets/core/mixins/align-horizontal-center' as *;

#current-channel-top-header {
  padding-left: 0.5rem;
}

#current-channel-element-wrapper {
  // Align content in the center on the x-axis
  display: flex;
  flex: 0 1 auto;
  flex-flow: row nowrap;
  min-height: 15rem;
  padding-left: 0.5rem;
  flex-direction: column;

  &.center-loading {
    @include align-center;
  }

  width: 100%;
  height: max-content;

  #list-icon {
    margin-right: 0.5rem;
    font-size: 2.5rem;
    line-height: 1;
    color: var.$scheme-purple;
  }

  #current-channel-element {
    display: flex;
    flex: 0 0 auto;
    flex-grow: 1;
    flex-direction: row;

    #channel-info-state {
      display: flex;
      text-align: start;
      flex-direction: column;
      margin-top: 0.9rem;

      div {
        @include align-center;
        font-style: italic;
        font-weight: bold;
        color: var.$scheme-gray-800;

        &.joining span {
          background: var.$scheme-starting-green;
        }

        &.healthy span {
          background: var.$scheme-healthy-green;
          animation: pulse-animation 2s infinite;
        }

        &.leaving span {
          background: var.$scheme-warning-yellow;
        }

        &.errored span {
          background: var.$scheme-catastrophic-red;
        }

        &.closed span {
          background: var.$scheme-danger-red;
        }

        &.unknown span {
          background: var.$scheme-gray-400;
        }

        @keyframes pulse-animation {
          0% {
            box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.2);
          }
          100% {
            box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
          }
        }

        span {
          display: inline-block;
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 50%;
          box-shadow: 0 0 1px 1px #0000001a;
          margin: 0 0.5rem 0.25rem 0.5rem;
        }
      }
    }

    #current-channel-element-info {
      display: flex;
      flex: 0 0 auto;
      flex-grow: 1;
      flex-direction: column;

      #channel-info-title {
        @include align-horizontal-center;

        span {
          padding-top: 1px;
        }

        code.small {
          font-size: 0.9rem;
        }
      }

      #channel-info-details {
        margin-left: 0.5rem;
        font-size: 1.1rem;
        line-height: 2rem;

        &, & * {
          background: transparent;
        }

        textarea {
          border: none;
          resize: none;
          padding: 0 0 0 0.25rem;
          margin: 0 0 0.5rem 0;
          width: 100%;

          &:hover {
            cursor: text;
          }
        }
      }

      code {
        padding: 0 0.25rem;
      }

      span {
        font-weight: bold;
      }
    }

    #current-channel-element-interaction {
      padding-right: 1rem;
    }
  }
}
</style>
