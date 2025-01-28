<script lang="ts" setup>
import { useLoadingStore } from '@/stores/loading'
import { storeToRefs } from 'pinia'

const loadingStore = useLoadingStore()

const { loading, currMsg } = storeToRefs(loadingStore)
</script>

<template>
  <div id="avoid-interaction-overlay" class="full-screen-overlay" v-if="loading">
    <div id="progress-spinner">
      <span class="loader-spinner"></span>
    </div>
    <div id="loader-text">
      <span>{{ currMsg || 'Loading...'}}</span>
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

  #loader-text {
    position: fixed;
    z-index: inherit;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    margin-top: 64px;
    padding: 10px;
    opacity: 100%;
    color: var.$text-color;
    font-size: 1.5rem;
    font-weight: 500;
  }
}
</style>
