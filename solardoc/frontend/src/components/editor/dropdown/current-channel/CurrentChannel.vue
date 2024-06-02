<script lang="ts" setup>
import { getHumanReadableTimeInfo } from '@/scripts/format-date'
import type { EditorChannel } from '@/services/phoenix/editor-channel'
import { useEditorUpdateWSClient } from '@/stores/editor-update-ws-client'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useChannelViewStore } from '@/stores/channel-view'
import { interceptErrors } from '@/errors/handler/error-handler'

const props = defineProps<{
  channel: EditorChannel
}>()

const editorUpdateWSClient = useEditorUpdateWSClient()
const currentChannelStore = useChannelViewStore()

const channelDescription = ref(props.channel.description || '<None provided>')

const { wsClient } = storeToRefs(editorUpdateWSClient)
const loadingState = ref(false)

async function handleLeaveChannel() {
  loadingState.value = true
  console.log('[ChannelView] Leaving channel')
  await wsClient.value?.leaveChannel()
  setTimeout(() => {
    currentChannelStore.unsetSelectedChannel()
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
          <div v-if="wsClient?.currentChannelState === 'joining'" class="joining">
            <span></span>
          </div>
          <div v-else-if="wsClient?.currentChannelState === 'leaving'" class="leaving">
            <span></span>
          </div>
          <div v-else-if="wsClient?.currentChannelState === 'errored'" class="errored">
            <span></span>
          </div>
          <div v-else-if="wsClient?.currentChannelState === 'closed'" class="closed">
            <span></span>
          </div>
          <div v-else-if="wsClient?.currentChannelState === 'joined'" class="healthy">
            <span></span>
          </div>
          <div v-else class="unknown"><span></span></div>
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
            <textarea v-model="channelDescription" disabled wrap="soft"></textarea>
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

<style lang="scss" scoped>
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
          animation: pulse-animation 1.75s infinite;
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
            box-shadow: 0 0 0 0 var.$scheme-pulse-color;
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

        &,
        & * {
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
