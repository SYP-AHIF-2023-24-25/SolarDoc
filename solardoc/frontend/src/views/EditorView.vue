<script lang="ts" setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCurrentUserStore } from '@/stores/current-user'
import FullScreenPreview from '@/components/editor/FullScreenPreview.vue'
import ChannelView from '@/components/editor/dropdown/current-channel/CurrentChannelWrapper.vue'
import ShareUrlCreate from '@/components/editor/dropdown/share-url/ShareUrlCreate.vue'
import Export from '@/components/editor/export/Export.vue'
import * as backendAPI from '@/services/render/api-service'
import { showWelcomeIfNeverShownBefore } from '@/scripts/show-welcome'
import { interceptErrors } from '@/errors/handler/error-handler'
import EditorSettings from '@/components/editor/dropdown/editor-settings/EditorSettings.vue'
import { initEditorFileBasedOnPath } from '@/scripts/editor/file'
import { useLoadingStore } from '@/stores/loading'
import DefaultEditorSubView from '@/components/editor/sub-views/default/DefaultEditorSubView.vue'
import FullScreenEditor from '@/components/editor/sub-views/full-screen-editor/FullScreenEditor.vue'
import FullScreenSlidesManager from '@/components/editor/sub-views/full-screen-slides-manager/FullScreenSlidesManager.vue'
import {
  DEFAULT_VIEW,
  FULL_SCREEN_EDITOR,
  FULL_SCREEN_SLIDES_MANGER,
} from '@/scripts/editor/sub-view-state'
import constants from '@/plugins/constants'
import EditorNavbar from '@/components/editor/editor-navbar/EditorNavbar.vue'

const $router = useRouter()
const $route = useRoute()
const currentUserStore = useCurrentUserStore()
const loadingStore = useLoadingStore()

// Lock the loading spinner and show a message until the editor is fully loaded
loadingStore.lockLoading()
loadingStore.pushMsg(constants.loadingMessages.loadingEditor)

// Manage the three different modes of the editor
const viewState = ref(DEFAULT_VIEW)
const phoneState = ref(FULL_SCREEN_EDITOR)

// Check if the user is on a phone (handle resizing)
const checkIfPhone = () => window.innerWidth < constants.MAX_PHONE_SIZE
const isPhone = ref(checkIfPhone())
window.addEventListener('resize', () => {
  isPhone.value = checkIfPhone()
})

const fileStateInitialised = ref(false)
const fileType = ref<Awaited<ReturnType<typeof initEditorFileBasedOnPath>>>('local')

// ---------------------------------------------------------------------------------------------------------------------
// ESSENTIAL CONNECTIONS
// ---------------------------------------------------------------------------------------------------------------------
interceptErrors(currentUserStore.fetchCurrentUserIfNotFetchedAndAuthValid())
interceptErrors(backendAPI.ensureRenderBackendIsReachable())
interceptErrors(
  (async () => {
    fileType.value = await initEditorFileBasedOnPath(
      $router,
      <string>$route.name,
      $route.params,
      $route.query,
    )
    fileStateInitialised.value = true
  })(),
  {
    onError: () => {
      fileStateInitialised.value = false
    },
    onFinally: () => {
      loadingStore.popMsg(constants.loadingMessages.loadingEditor)
      loadingStore.unlockLoading()
    },
  }
)
// ---------------------------------------------------------------------------------------------------------------------

// We need to be friendly after all :D
showWelcomeIfNeverShownBefore()
</script>

<template>
  <ShareUrlCreate />
  <ChannelView />
  <FullScreenPreview />
  <EditorSettings />
  <Export />
  <div id="editor-page" :class="fileStateInitialised ? '' : 'blocked'">
    <EditorNavbar />
    <div id="editor-and-preview-wrapper">
      <DefaultEditorSubView
        v-if="viewState === DEFAULT_VIEW && !isPhone"
        @viewStateUpdate="payload => (viewState = payload) & (phoneState = FULL_SCREEN_EDITOR)"
      />
      <FullScreenSlidesManager
        v-else-if="
          (viewState === FULL_SCREEN_SLIDES_MANGER && !isPhone) ||
          (phoneState === FULL_SCREEN_SLIDES_MANGER && isPhone)
        "
        @viewStateUpdate="_ => (viewState = DEFAULT_VIEW) & (phoneState = FULL_SCREEN_EDITOR)"
      />
      <FullScreenEditor
        v-else
        @viewStateUpdate="
          _ => (viewState = DEFAULT_VIEW) & (phoneState = FULL_SCREEN_SLIDES_MANGER)
        "
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/core/mixins/link-hover-presets' as *;
@use '@/assets/core/mixins/view-presets' as *;
@use '@/assets/core/mixins/align-center' as *;
@use '@/assets/core/var' as var;

$total-width: 100vw;
div#editor-page {
  @include view-presets;

  &.blocked {
    pointer-events: none;
    opacity: 0.5;
  }

  #editor-and-preview-wrapper {
    display: flex;
    flex-flow: row nowrap;
    border-top: var.$editor-border;
    box-sizing: border-box;
    max-width: $total-width;
  }
}
</style>
