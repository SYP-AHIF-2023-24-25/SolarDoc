<script lang="ts" setup>
import type { Vueform } from '@vueform/vueform'
import CloseButtonSVG from '@/components/icons/CloseButtonSVG.vue'
import SDRouterLink from '@/components/SDRouterLink.vue'
import { handleCopy } from '@/scripts/handle-copy'
import { useOverlayStateStore } from '@/stores/overlay-state'
import { useCurrentUserStore } from '@/stores/current-user'
import { useCurrentFileStore } from '@/stores/current-file'
import * as phoenixRestService from '@/services/phoenix/api-service'
import { PhoenixInternalError, PhoenixRestError } from '@/services/phoenix/errors'
import { ref } from 'vue'

const overlayStateStore = useOverlayStateStore()
const currentUserStore = useCurrentUserStore()
const currentFileStore = useCurrentFileStore()

const generatedLink = ref('')

async function handleGeneratedLinkCopyButtonClick() {
  if (generatedLink.value) {
    await handleCopy(generatedLink.value)
  }
}

async function submitForm(
  form$: Vueform & {
    requestData: {
      write: boolean
      generatedLink: string
    }
  },
) {
  if (currentUserStore.bearer !== undefined) {
    if (currentFileStore.fileId !== undefined) {
      let perms: number = 1
      if (form$.requestData.write) {
        perms = 3
      }
      let resp: Awaited<ReturnType<typeof phoenixRestService.postV1Share>>
      try {
        resp = await phoenixRestService.postV1Share(currentUserStore.bearer, {
          file_id: currentFileStore.fileId,
          perms: perms,
        })
      } catch (e) {
        throw new PhoenixInternalError(
          'Critically failed to fetch current user. Cause: ' + (<Error>e).message,
        )
      }
      if (resp.status === 401) {
        throw new PhoenixRestError('Server rejected request to fetch current user', resp.status)
      }
      if (resp.status === 201) {
        generatedLink.value = `${window.location.origin}/share/${resp.data.id}`
      }
    }
  }
}
</script>

<template>
  <div
    v-if="overlayStateStore.createShareUrl"
    id="full-screen-wrapper"
    class="blurred-background-full-screen-overlay"
  >
    <div id="share-url-view-create">
      <div id="share-url-view-header">
        <button id="close-button" @click="overlayStateStore.setShareUrlView(false)">
          <CloseButtonSVG />
        </button>
        <h1>Create Share URL</h1>
      </div>
      <div v-if="!currentUserStore.loggedIn" id="channel-view-not-logged-in">
        <p>
          You need to be logged in to create a share url!
          <SDRouterLink class="emphasised-link" to="/login">→ Log in!</SDRouterLink>
        </p>
      </div>
      <div v-else-if="currentFileStore.fileId === undefined" id="channel-view-not-logged-in">
        <p>You need to save your file to share it!</p>
      </div>
      <template v-else>
        <div id="generated-link-display">
          <i
            :class="'pi pi-clipboard' + (generatedLink ? '' : ' disabled')"
            @click="handleGeneratedLinkCopyButtonClick()"
          ></i>
          <p>{{ generatedLink || 'Your generated link~ °^°' }}</p>
        </div>
        <Vueform
          ref="form$"
          :display-errors="false"
          :endpoint="false"
          add-class="solardoc-style-form"
          @submit="submitForm"
        >
          <CheckboxElement
            disabled
            name="write"
            size="lg"
            text="Write access"
            default="true"
          />
          <ButtonElement
            :columns="{
              container: 1,
            }"
            :submits="true"
            button-label="Create"
            name="create"
          />
        </Vueform>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/core/var' as var;
@use '@/assets/core/mixins/align-center' as *;
@use '@/assets/core/mixins/align-horizontal-center' as *;

#full-screen-wrapper {
  @include align-center;

  #share-url-view-create {
    position: relative;
    flex: 0 1 auto;
    height: max-content;
    border-radius: 1rem;
    padding: 0.5rem 2rem;
    background-color: var.$overlay-background-color;
    box-shadow: 0 0 10px 0 var.$box-shadow-color;

    // Adjust size depending on the screen width
    width: 90vw;

    @media screen and (min-width: var.$window-medium) {
      & {
        width: 60vw;
      }
    }

    @media screen and (min-width: var.$window-xlarge) {
      & {
        width: 50vw;
      }
    }

    #close-button {
      position: absolute;
      z-index: 101;
      margin: 0;
      right: 3rem;
      top: calc(0.5rem + 40px * 0.67 + 40px - 1.5rem - 4px);

      svg {
        width: 1.5rem;
        height: 1.5rem;
        fill: var.$text-color;
      }
    }

    p {
      margin-bottom: 1rem;
    }

    .solardoc-style-form {
      margin-bottom: 1rem;
    }

    #generated-link-display {
      @include align-horizontal-center;
      position: relative;
      padding: 0.6rem 1rem;
      color: var.$text-color;
      border: 1px solid var.$vueform-highlighted-box-border-color;
      background-color: var.$vueform-highlighted-box-background-color;
      border-radius: 0.5rem;
      margin-bottom: 1rem;

      p {
        margin: 0;
        padding: 0;
      }

      .pi.pi-clipboard {
        position: absolute;
        z-index: 101;
        right: 0.6rem;
        margin: 0;
        padding: 0.4rem;
        border-radius: 0.5rem;
        background-color: transparent;

        &:not(.disabled):hover {
          cursor: pointer;
          background-color: var.$vueform-highlighted-box-background-color-hover;
        }

        &:not(.disabled):active {
          background-color: var.$vueform-highlighted-box-background-color-active;
        }

        &.disabled {
          cursor: not-allowed;
        }
      }
    }
  }
}
</style>
