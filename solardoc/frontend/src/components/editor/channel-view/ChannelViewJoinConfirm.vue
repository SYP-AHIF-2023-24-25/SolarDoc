<script setup lang="ts">
import { useChannelViewStore } from '@/stores/channel-view'

const channelState = useChannelViewStore()

function handleGoBack() {
  channelState.unsetCurrentChannel()
}
</script>

<template>
  <div id="channel-view-join-confirm-wrapper">
    <Vueform add-class="solardoc-style-form" :display-errors="false">
      <TextElement
        name="password"
        input-type="password"
        label="Password"
        :rules="[
          'required',
          'min:10',
        ]"
      />
      <ButtonElement
        name="confirm"
        button-label="Confirm"
        :columns="{
          container: 1,
        }"
        submits
      />
      <ButtonElement
        name="goBack"
        button-label="Go Back"
        @click="handleGoBack"
        :columns="{
          container: 2,
        }"
        :secondary="true"
        align="center"
      />
    </Vueform>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/var' as var;

#channel-view-join-confirm-wrapper {
  p {
    margin-bottom: 1rem;
  }
}
</style>
