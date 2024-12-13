<script setup lang="ts">
import { useCurrentFileStore } from '@/stores/current-file'
import constants from '@/plugins/constants'

const currentFileStore = useCurrentFileStore()

function getSaveStateCSSClass() {
  return currentFileStore.remoteFile ? (currentFileStore.shareFile ? 'shared' : 'saved') : 'error'
}

function getSaveState() {
  return currentFileStore.remoteFile
    ? currentFileStore.shareFile
      ? constants.saveStates.shared
      : constants.saveStates.server
    : constants.saveStates.local
}
</script>

<template>
  <div id="save-state" v-tooltip="'Indicates whether the file is saved remotely on the server'">
    <p :class="getSaveStateCSSClass()">
      {{ getSaveState() }}
    </p>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/mixins/align-center' as *;
@use '@/assets/core/mixins/screen-size' as *;
@use '@/assets/core/var' as var;

#save-state {
  @include align-center;
  display: flex;
  flex-flow: row nowrap;
  height: 100%;
  max-width: 100%;
  font-size: 0.8rem;

  & > p {
    @include align-center;
    height: 1.5rem;
    color: var.$scheme-gray-600;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;

    padding: 0 0.25rem;
    @include r-min(var.$window-xlarge) {
      padding: 2px 0.5rem 0;
    }

    background-color: var.$scheme-gray-300;
    border-radius: 2px;

    &.shared {
      background-color: var.$save-state-background-shared;
      color: white;
    }

    &.saved {
      background-color: var.$save-state-background-saved;
      color: white;
    }

    &.error {
      background-color: var.$save-state-background-error;
      color: white;
    }

    &.not-saved {
      background-color: var.$save-state-background-not-saved;
      color: white;
    }
  }
}
</style>
