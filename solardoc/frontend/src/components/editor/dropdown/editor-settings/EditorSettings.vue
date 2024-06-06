<script setup lang="ts">
import { useOverlayStateStore } from '@/stores/overlay-state'
import CloseButtonSVG from '@/components/icons/CloseButtonSVG.vue'
import { useCurrentFileStore } from '@/stores/current-file'
import { getHumanReadableTimeInfo } from '@/scripts/format-date'
import { ref } from 'vue'

const overlayStateStore = useOverlayStateStore()
const currentFileStore = useCurrentFileStore()

// Last modified is a ref which is updated every 0.5 second to show the last modified time
let lastModified = ref(getLastModified())
let created = ref(getCreated())

function getLastModified(): string {
  return getHumanReadableTimeInfo(currentFileStore.lastModified)
}

function getCreated(): string {
  return getHumanReadableTimeInfo(currentFileStore.created)
}

const updateTimeRefs = () => {
  lastModified.value = getLastModified()
  created.value = getCreated()
}
setInterval(updateTimeRefs, 500)
</script>

<template>
  <div
    v-if="overlayStateStore.settings"
    id="full-screen-wrapper"
    class="page-content-wrapper blurred-background-full-screen-overlay"
  >
    <div id="file-settings" class="page-content-container large full-screen-overlay-content">
      <div id="settings-view-header">
        <h1>File Settings</h1>
        <button id="close-button" @click="overlayStateStore.setSettings(false)">
          <CloseButtonSVG />
        </button>
      </div>
      <div id="settings-file-info">
        <h2 id="settings-file-info-title">
          File Information •<code>{{ currentFileStore.fileName }}</code>
        </h2>
        <p id="settings-file-info-file-id">
          <i class="pi pi-wrench"></i>
          ID: {{ currentFileStore.fileId || 'Not registered' }}
        </p>
        <div id="settings-file-info-details">
          <p><span>Owner:</span> {{ currentFileStore.ownerId }}</p>
          <p><span>Created:</span> {{ created }}</p>
          <p><span>Last Modified:</span> {{ lastModified }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/var' as var;
@use '@/assets/core/mixins/align-center' as *;
@use '@/assets/core/mixins/align-horizontal-center' as *;
@use '@/assets/core/mixins/icon-presets' as *;
@use '@/assets/full-screen-overlay' as *;

#full-screen-wrapper {
  @include align-center;

  #file-settings {
    position: relative;
    flex: 0 1 auto;
    height: max-content;
    border-radius: 1rem;
    padding: 0.5rem 2rem;
    background-color: var.$overlay-background-color;
    box-shadow: 0 0 10px 0 var.$box-shadow-color;

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

    #settings-file-info {
      display: flex;
      flex: 0 0 auto;
      flex-grow: 1;
      flex-direction: column;
      margin-bottom: 1rem;

      #settings-file-info-title {
        @include align-horizontal-center;
        margin-bottom: 0;

        span {
          padding-top: 1px;
        }

        code {
          font-size: 0.9em;
          padding-bottom: 0.3rem;
        }
      }

      #settings-file-info-file-id {
        margin: 0.1rem 0 0 0;
        padding: 0 0 0 0.6rem;
        font-size: 0.9rem;
        line-height: 1.5rem;

        i {
          @include icon-presets;
        }
      }

      #settings-file-info-details {
        margin-left: 0.5rem;
        line-height: 2rem;

        &,
        & * {
          background: transparent;
        }
      }

      code {
        padding: 0 0.25rem;
      }

      span {
        font-weight: bold;
      }
    }
  }
}
</style>
