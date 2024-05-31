<script lang="ts" setup>
import type {CreateEditorChannel, EditorChannel, JoinChannelOptions,} from '@/services/phoenix/editor-channel'
import {useChannelViewStore} from '@/stores/channel-view'
import {ref} from 'vue'
import {useEditorUpdateWSClient} from '@/stores/editor-update-ws-client'
import {useCurrentUserStore} from '@/stores/current-user'
import type {Vueform} from '@vueform/vueform'
import {useCurrentFileStore} from '@/stores/current-file'
import {handleOTUpdates} from '@/services/phoenix/ot-trans'
import {PhoenixNotAuthorisedError, PhoenixSDSError} from '@/services/phoenix/errors'
import {interceptErrors} from '@/errors/handler/error-handler'

const currentUserStore = useCurrentUserStore()
const currentFileStore = useCurrentFileStore()
const channelViewStore = useChannelViewStore()
const editorUpdateWSClient = useEditorUpdateWSClient()

const SAFETY_DELAY_MS = 1000
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
    throw new PhoenixNotAuthorisedError('User is not logged in.', 'Please log in and try again.')
  } else if (!editorUpdateWSClient.wsClient || !editorUpdateWSClient.wsClient.healthy) {
    throw new PhoenixSDSError(
      'Websocket client is not active or healthy. Can not join channel!',
      'Please reload page and try again later. If the problem persists, contact the developers.',
    )
  }

  const newChannel = {
    name: form$.requestData['channel-name'],
    description: form$.requestData.description,
    password: form$.requestData.password,
    file_id: currentFileStore.fileId!,
  } satisfies CreateEditorChannel

  async function joinNewChannel(channel: EditorChannel) {
    await editorUpdateWSClient.wsClient?.joinChannel(
      `channel:${channel.id}`,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async _ => {
        channelViewStore.setCreatingChannel(false)
        channelViewStore.setChannelJoined(true)
        channelViewStore.setSelectedChannel(channel)
        console.log(`[ChannelView] Channel joined (Id: ${channel.id})`)

        // Start the ot update handler
        handleOTUpdates()
      },
      errorResp => {
        console.error('[ChannelView] Failed to join new channel', errorResp)
        throw new PhoenixSDSError(
          'Failed to join new channel',
          'Please try again. If the problem persists, check the logs and contact the developers.',
        )
      },
      currentUserStore.currentUser!.id,
      {
        auth: newChannel.password,
      } satisfies JoinChannelOptions,
    )
  }

  await editorUpdateWSClient.wsClient.createChannel(
    async (channel, initTrans) => {
      console.log('[ChannelView] Channel created', channel)
      await currentFileStore.initOTransStackFromServerTrans(initTrans)
      setTimeout(() => joinNewChannel(channel), SAFETY_DELAY_MS)
    },
    errorResp => {
      console.error('[ChannelView] Failed to create new channel', errorResp)
      throw new PhoenixSDSError(
        'Failed to create new channel',
        'Please try again. If the problem persists, check the logs and contact the developers.',
      )
    },
    newChannel,
    currentFileStore.content,
    // Current-User must be present since otherwise the user wouldn't be able to access this form
    currentUserStore.currentUser!.id,
  )
  loadingState.value = true
}
</script>

<template>
  <div id="channel-view-create">
    <Vueform
      v-if="!loadingState"
      ref="form$"
      :display-errors="false"
      :endpoint="false"
      add-class="solardoc-style-form"
      @submit="(value: any) => interceptErrors(submitForm(value))"
    >
      <TextElement
        :rules="['required', 'min:4', 'max:25']"
        label="Channel name"
        name="channel-name"
      />
      <TextElement
        :rules="['required', 'min:10']"
        input-type="password"
        label="Password"
        name="password"
      />
      <TextareaElement label="Channel description" name="description" />
      <ButtonElement
        :columns="{
          container: 1,
        }"
        :submits="true"
        button-label="Create"
        name="Create"
      />
      <ButtonElement
        :columns="{
          container: 2,
        }"
        :resets="true"
        :secondary="true"
        align="center"
        button-label="Go Back"
        name="goBack"
        @click="handleGoBack"
      />
    </Vueform>
    <div v-else id="loading-banner">
      <h2><span class="dot-dot-dot-flashing"></span></h2>
    </div>
  </div>
</template>

<style lang="scss" scoped>
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
