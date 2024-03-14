<script setup lang="ts">
import {useChannelsStore} from "@/stores/channels";

const channelState = useChannelsStore()

function handleGoBack() {
  channelState.setCreatingChannel(false)
}
</script>

<template>
  <div id="channel-view-create">
    <p>Creation form in work...</p>
    <button class="highlighted-button" @click="handleGoBack">Go Back</button>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/var' as var;

#channel-view-create {
  p {
    margin-bottom: 1rem;
  }
}
</style>
