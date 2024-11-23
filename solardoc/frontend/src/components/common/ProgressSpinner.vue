<script lang="ts" setup>
import { useLoadingStore } from '@/stores/loading'

const loadingStore = useLoadingStore()
</script>

<template>
  <div id="avoid-interaction-overlay" class="full-screen-overlay" v-if="loadingStore.loading">
    <div id="progress-spinner">
      <span class="loader-spinner"></span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/core/spinner' as *;
@use '@/assets/core/var' as var;
@use '@/assets/full-screen-overlay' as *;

#avoid-interaction-overlay {
  position: fixed;
  z-index: 999; // Maximum z-index for the whole app
  background: rgba(0, 0, 0, 0.1);
  transition: background 0.3s;
  cursor: wait;

  // Block all interactions
  pointer-events: all;

  #progress-spinner {
    position: fixed;
    z-index: inherit;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 100%;
  }
}
</style>
