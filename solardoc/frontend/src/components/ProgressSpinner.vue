<script setup lang="ts">
import { useLoadingStore } from '@/stores/loading'

const loadingStore = useLoadingStore()
</script>

<template>
  <div id="progress-spinner" v-show="loadingStore.loading">
    <span class="loader-spinner"></span>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/spinner' as *;
@use '@/assets/core/var' as var;

div#progress-spinner {
  z-index: 100;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
