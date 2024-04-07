<script setup lang="ts">
import type {
  CreateEditorChannel,
  EditorChannel,
  JoinChannelOptions,
} from '@/services/phoenix/editor-channel'
import { useChannelViewStore } from '@/stores/channel-view'
import { ref } from 'vue'
import { useWSClientStore } from '@/stores/ws-client'
import { useCurrentUserStore } from '@/stores/current-user'
import type { Vueform } from '@vueform/vueform'

const currentUserStore = useCurrentUserStore()
const channelViewStore = useChannelViewStore()
const wsClientStore = useWSClientStore()

const loadingState = ref(false)

function handleGoBack() {
  channelViewStore.setCreatingChannel(false)
}

async function submitForm(
  form$: Vueform & {
    requestData: {
      'channel-name': string
      description: string
      password: string
    }
  },
) {
  if (!form$?.requestData) {
    return
  } else if (!currentUserStore.loggedIn || !currentUserStore.bearer) {
    throw new Error(
      "[ChannelView] User is not logged in! User shouldn't have been able to access this form",
    )
  } else if (!wsClientStore.wsClient || !wsClientStore.wsClient.healthy) {
    throw new Error(
      '[ChannelView] Websocket client is not active or healthy. Can not join channel!',
    )
  }

  const newChannel = {
    name: form$.requestData['channel-name'],
    description: form$.requestData.description,
    password: form$.requestData.password,
  } satisfies CreateEditorChannel

  async function joinNewChannel(channel: EditorChannel) {
    await wsClientStore.wsClient?.joinChannel(
      `channel:${channel.id}`,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async _ => {
        channelViewStore.setCreatingChannel(false)
        channelViewStore.setChannelJoined(true)
        channelViewStore.setSelectedChannel(channel)
        console.log(`[ChannelView] Channel joined (Id: ${channel.id})`)
      },
      errorResp => {
        console.error('[ChannelView] Error joining new channel', errorResp)
      },
      {
        auth: newChannel.password,
      } satisfies JoinChannelOptions,
    )
  }

  await wsClientStore.wsClient.createChannel(
    async channel => {
      console.log('[ChannelView] Channel created', channel)
      await joinNewChannel(channel)
    },
    errorResp => {
      console.error('[ChannelView] Error creating channel', errorResp)
    },
    newChannel,
  )
  loadingState.value = true
}
</script>

<template>
  <div id="channel-view-create">
    <Vueform
      v-if="!loadingState"
      ref="form$"
      add-class="solardoc-style-form"
      :display-errors="false"
      :endpoint="false"
      @submit="submitForm"
    >
      <TextElement
        name="channel-name"
        label="Channel name"
        :rules="['required', 'min:4', 'max:25']"
      />
      <TextElement
        name="password"
        input-type="password"
        label="Password"
        :rules="['required', 'min:10']"
      />
      <TextareaElement name="description" label="Channel description" />
      <ButtonElement
        name="Create"
        button-label="Create"
        :columns="{
          container: 1,
        }"
        :submits="true"
      />
      <ButtonElement
        name="goBack"
        button-label="Go Back"
        @click="handleGoBack"
        :resets="true"
        :columns="{
          container: 2,
        }"
        :secondary="true"
        align="center"
      />
    </Vueform>
    <div v-else id="loading-banner">
      <h2><span class="dot-dot-dot-flashing"></span></h2>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/var' as var;
@use '@/assets/core/mixins/align-center' as *;

#channel-view-create {
  p {
    margin-bottom: 1rem;
  }
}

#loading-banner {
  @include align-center;

  margin: 2rem 0;
}
</style>
