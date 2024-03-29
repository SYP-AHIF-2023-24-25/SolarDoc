<script setup lang="ts">
import { useChannelViewStore } from '@/stores/channel-view'
import { useWSClientStore } from '@/stores/ws-client'
import { ref } from 'vue'
import type { EditorChannel, JoinChannelOptions } from '@/services/phoenix/editor-channel'
import type { Vueform } from '@vueform/vueform'

const channelState = useChannelViewStore()
const wsClientStore = useWSClientStore()
const channelViewStore = useChannelViewStore()

const loadingState = ref(false)

const props = defineProps<{
  channel: EditorChannel
}>()

async function submitForm(
  form$: Vueform & {
    requestData: {
      password: string
    }
  },
) {
  if (!form$?.requestData) {
    return
  } else if (!wsClientStore.wsClient || !wsClientStore.wsClient.healthy) {
    throw new Error(
      '[ChannelView] Websocket client is not active or healthy. Can not join channel!',
    )
  }

  loadingState.value = true
  await wsClientStore.wsClient?.joinChannel(
    `channel:${props.channel.id}`,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async _ => {
      channelViewStore.setChannelJoined(true)
      channelViewStore.setSelectedChannel(props.channel)
      console.log(`[ChannelView] Channel joined (Id: ${props.channel.id})`)
    },
    errorResp => {
      console.error('[ChannelView] Error joining new channel', errorResp)
    },
    {
      auth: form$.requestData.password,
    } satisfies JoinChannelOptions,
  )
  loadingState.value = false
}

function handleGoBack() {
  channelState.unsetSelectedChannel()
}
</script>

<template>
  <div v-if="!loadingState" id="channel-view-join-confirm-wrapper">
    <h2>Please enter password for "{{ channel.name }}"</h2>
    <Vueform
      ref="form$"
      add-class="solardoc-style-form"
      :display-errors="false"
      :endpoint="false"
      @submit="submitForm"
    >
      <TextElement
        name="password"
        input-type="password"
        label="Password"
        :rules="['required', 'min:10']"
      />
      <ButtonElement
        name="confirm"
        button-label="Confirm"
        :columns="{
          container: 1,
        }"
        :submits="true"
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
  <div v-else id="loading-banner">
    <h2><span class="dot-dot-dot-flashing"></span></h2>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/var' as var;

#channel-view-join-confirm-wrapper {
  display: flex;
  flex-flow: column nowrap;

  p {
    margin-bottom: 1rem;
  }
}
</style>
