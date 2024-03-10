<script setup lang="ts">
import {useChannelsStore} from "@/stores/channels";

const channelState = useChannelsStore()

function handleGoBack() {
  channelState.unsetCurrentChannel()
}
</script>

<template>
  <div id="channel-view-join-confirm-wrapper">
    <p>Authentication form in work...</p>
    <button class="highlighted-button" @click="handleGoBack">Go Back</button>
  </div>
</template>

<style scoped lang="scss">
#channel-view-join-confirm-wrapper {
  p {
    margin-bottom: 1rem;
  }
}
</style>
