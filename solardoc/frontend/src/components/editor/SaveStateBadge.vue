<script setup lang="ts">
import { useCurrentFileStore } from '@/stores/current-file'
import constants from '@/plugins/constants'
import UploadIconSVG from "@/components/icons/UploadIconSVG.vue";

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
      <span v-if="getSaveState() === 'Saved Locally'">
        <UploadIconSVG />
      </span>
    </p>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/var' as var;
@use '@/assets/core/mixins/align-center' as *;

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
    @media screen and (min-width: var.$window-xlarge) {
      & {
        padding: 2px 0.5rem 0;
      }
    }

    span {
      @include align-center;
      height: calc(100% - 0.3rem);
      width: 1.5rem;
      margin: 0.1rem 0 0.2rem 0.1rem;
      border-radius: 0.25rem;
      padding: 0 0.25rem;
      box-sizing: border-box;

      &:hover {
        cursor: pointer;
        background-color: var.$scheme-catastrophic-red;
      }
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
