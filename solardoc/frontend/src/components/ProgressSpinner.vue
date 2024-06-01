<script lang="ts" setup>
import {useLoadingStore} from '@/stores/loading'

const loadingStore = useLoadingStore()
</script>

<template>
  <div v-show="loadingStore.loading" id="progress-spinner">
    <span class="loader-spinner"></span>
  </div>
</template>

<style lang="scss" scoped>
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
