<script setup lang="ts">
import { useChannelViewStore } from '@/stores/channel-view'
import type {CreateEditorChannel} from "@/services/phoenix/editor-channel";
import {ref} from "vue";
import {useWSClientStore} from "@/stores/ws-client";
import {useCurrentUserStore} from "@/stores/current-user";

const currentUserStore = useCurrentUserStore()
const channelViewStore = useChannelViewStore()
const wsClientStore = useWSClientStore()

const form$ = ref<{
  data: {
    "channel-name": string
    description: string
    password: string
  }
} | null>(null)

const loadingState = ref(false)

function handleGoBack() {
  channelViewStore.setCreatingChannel(false)
}

async function submitForm() {
  if (!form$.value) {
    throw new Error('Form data is null')
  } else if (!currentUserStore.loggedIn || !currentUserStore.bearer) {
    throw new Error('[ChannelView] User is not logged in! User shouldn\'t have been able to access this form')
  } else if (!wsClientStore.wsClient || !wsClientStore.wsClient.healthy) {
    throw new Error('[ChannelView] Websocket client is not active or healthy. Can not join channel!')
  }

  await wsClientStore.wsClient.createChannel(
    async channel => {
      channelViewStore.setCreatingChannel(false)
      channelViewStore.setChannelJoined(true)
      channelViewStore.setCurrentChannel(channel)
    },
    errorResp => {
      console.error('Error creating channel', errorResp)
    },
    {
      name: form$.value.data['channel-name'],
      description: form$.value.data.description,
      password: form$.value.data.password,
      creator: currentUserStore.currentUser!.id
    } satisfies CreateEditorChannel,
  )
  loadingState.value = true
}
</script>

<template>
  <div id="channel-view-create">
    <Vueform v-if="!loadingState" ref="form$" add-class="solardoc-style-form" :display-errors="false">
      <TextElement
        name="channel-name"
        label="Channel name"
        :rules="[
          'required',
          'min:4',
          'max:25'
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
        submits
        @click="submitForm()"
        :columns="{
          container: 1,
        }"
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
