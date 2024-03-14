<script setup lang="ts">
import { useChannelsStore } from '@/stores/channels'

const channelState = useChannelsStore()

function handleGoBack() {
  channelState.setCreatingChannel(false)
}
</script>

<template>
  <div id="channel-view-create">
    <Vueform add-class="solardoc-style-form" :display-errors="false">
      <TextElement
          name="channelName"
          label="Channel name"
          :rules="[
        'required',
        'min:4',
      ]"
      />
      <TextElement
          name="password"
          input-type="password"
          label="Password"
          :rules="[
        'required',
        'min:10',
      ]"
      />
      <TextareaElement
          name="description"
          label="Channel description"
      />
      <ButtonElement
          name="Create"
          button-label="Create"
          :submits="true"
          :columns="{
        container: 3,
      }"
      />
      <ButtonElement
          name="goBack"
          button-label="Go Back"
          @click="handleGoBack"
          :resets="true"
          :columns="{
        container: 3,
      }"
          :secondary="true"
          align="center"
      />
    </Vueform>
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
