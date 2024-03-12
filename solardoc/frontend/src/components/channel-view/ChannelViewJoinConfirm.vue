<script setup lang="ts">
import {useChannelsStore} from "@/stores/channels";

const channelState = useChannelsStore()

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
        container: 3,
      }"
      />
      <ButtonElement
          name="goBack"
          button-label="Go Back"
          @click="handleGoBack"
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
#channel-view-join-confirm-wrapper {
  p {
    margin-bottom: 1rem;
  }
}
</style>
