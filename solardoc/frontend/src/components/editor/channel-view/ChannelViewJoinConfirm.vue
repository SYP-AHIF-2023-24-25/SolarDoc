<script setup lang="ts">
import { ref } from 'vue'
import { useChannelViewStore } from '@/stores/channel-view'
import { useEditorUpdateWSClient } from '@/stores/editor-update-ws-client'
import { useCurrentFileStore } from '@/stores/current-file'
import type { EditorChannel, JoinChannelOptions } from '@/services/phoenix/editor-channel'
import type { Vueform } from '@vueform/vueform'
import type { OTransRespDto } from '@/services/phoenix/ot-trans'
import type { File } from '@/services/phoenix/gen/phoenix-rest-service'
import { useCurrentUserStore } from '@/stores/current-user'
import { handleOTUpdates } from '@/scripts/handle-ot'
import { PhoenixSDSError } from '@/services/phoenix/errors'

const currentUserStore = useCurrentUserStore()
const currentFileStore = useCurrentFileStore()
const channelState = useChannelViewStore()
const editorUpdateWSClient = useEditorUpdateWSClient()
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
  } else if (!editorUpdateWSClient.wsClient || !editorUpdateWSClient.wsClient.healthy) {
    throw new PhoenixSDSError(
      'Websocket client is not active or healthy. Can not join channel!',
      'Please reload page and try again later. If the problem persists, contact the developers.',
    )
  }

  loadingState.value = true
  await editorUpdateWSClient.wsClient?.joinChannel(
    `channel:${props.channel.id}`,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async (initTrans: OTransRespDto, file: Required<File>) => {
      currentFileStore.setFile(file)
      currentFileStore.initOTransStackFromServerTrans(initTrans)

      channelViewStore.setChannelJoined(true)
      channelViewStore.setSelectedChannel(props.channel)
      console.log(`[ChannelView] Channel joined (Id: ${props.channel.id})`)

      // Start the ot update handler
      handleOTUpdates()
    },
    errorResp => {
      console.error('[ChannelView] Error joining channel:', errorResp)
      throw new PhoenixSDSError(
        'Error joining channel',
        'Please try again later. If the problem persists, contact the developers.',
      )
    },
    currentUserStore.currentUser!.id,
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
          default: { container: 2 },
          sm: { container: 1 },
          md: { container: 1 },
        }"
        :submits="true"
        style="width: 10rem"
      />
      <ButtonElement
        name="goBack"
        button-label="Go Back"
        @click="handleGoBack"
        :columns="{
          default: { container: 2 },
          sm: { container: 3 },
          md: { container: 1 },
        }"
        :secondary="true"
        align="center"
        style="width: 10rem"
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
