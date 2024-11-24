<script lang="ts" setup>
import { ref } from 'vue'
import { usePreviewLoadingStore } from '@/stores/preview-loading'
import { useOverlayStateStore } from '@/stores/overlay-state'
import { handleCopy } from '@/scripts/handle-copy'
import { useCurrentUserStore } from '@/stores/current-user'
import { useCurrentFileStore } from '@/stores/current-file'
import { getHumanReadableTimeInfo } from '@/scripts/format-date'
import FullScreenPreview from '@/components/editor/FullScreenPreview.vue'
import EditorSandwichDropdown from '@/components/editor/dropdown/EditorSandwichDropdown.vue'
import ChannelView from '@/components/editor/dropdown/current-channel/CurrentChannelWrapper.vue'
import ShareUrlCreate from '@/components/editor/dropdown/share-url/ShareUrlCreate.vue'
import * as backendAPI from '@/services/render/api-service'
import * as phoenixBackend from '@/services/phoenix/api-service'
import { showWelcomeIfNeverShownBefore } from '@/scripts/show-welcome'
import { interceptErrors } from '@/errors/handler/error-handler'
import EditorSettings from '@/components/editor/dropdown/editor-settings/EditorSettings.vue'
import { createEditorRemoteFileConnection } from '@/scripts/editor/file'
import { useLoadingStore } from '@/stores/loading'
import SaveStateBadge from '@/components/editor/SaveStateBadge.vue'
import DefaultEditorSubView from "@/components/editor/sub-views/default/DefaultEditorSubView.vue";
import FullScreenEditor from "@/components/editor/sub-views/full-screen-editor/FullScreenEditor.vue";
import FullScreenSlidesManager from "@/components/editor/sub-views/full-screen-slides-manager/FullScreenSlidesManager.vue";
import {DEFAULT_VIEW, FULL_SCREEN_EDITOR, FULL_SCREEN_SLIDES_MANGER} from "@/scripts/editor/sub-view-state";

const previewLoadingStore = usePreviewLoadingStore()
const overlayStateStore = useOverlayStateStore()
const currentUserStore = useCurrentUserStore()
const currentFileStore = useCurrentFileStore()
const loadingStore = useLoadingStore()

// Manage the three different modes of the editor
const viewState = ref(DEFAULT_VIEW)

// We need to be friendly after all :D
showWelcomeIfNeverShownBefore()

// ---------------------------------------------------------------------------------------------------------------------
// ESSENTIAL CONNECTIONS
// ---------------------------------------------------------------------------------------------------------------------
interceptErrors(currentUserStore.fetchCurrentUserIfNotFetchedAndAuthValid())
interceptErrors(backendAPI.ensureRenderBackendIsReachable())
interceptErrors(
  (async () => {
    loadingStore.setLoading(true)
    await phoenixBackend.ensurePhoenixBackendIsReachable()
    await createEditorRemoteFileConnection()
    loadingStore.setLoading(false)
  })(),
)
// ---------------------------------------------------------------------------------------------------------------------

// Enable loading spinner for preview if the button is clicked
function handlePreviewButtonPress() {
  overlayStateStore.setFullScreenPreview(true)
  console.log('[Editor] Preview button clicked')
}

let copyButtonTimeout: null | ReturnType<typeof setTimeout> = null
const copyButtonContent = ref('Copy')

function handleCopyButtonClick() {
  handleCopy(currentFileStore.content)
  copyButtonContent.value = 'Copied!'
  if (copyButtonTimeout) {
    clearTimeout(copyButtonTimeout)
  }
  copyButtonTimeout = setTimeout(() => {
    copyButtonContent.value = 'Copy'
  }, 1000)
}

function handleDownloadButtonClick() {
  let text: string = currentFileStore.content
  let fileName: string = currentFileStore.fileName
  let fileType: string = 'text/asciidoc'
  let bloby: Blob = new Blob([text], { type: fileType })

  let a = document.createElement('a')
  a.download = fileName
  a.href = URL.createObjectURL(bloby)
  a.dataset.downloadurl = [fileType, a.download, a.href].join(':')
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(function () {
    URL.revokeObjectURL(a.href)
  }, 1500)
}

function handleShareButtonClick() {
  overlayStateStore.setShareUrlView(true)
}

// Last modified is a ref which is updated every 0.5 second to show the last modified time
let lastModified = ref(getLastModified())

function getLastModified(): string {
  return getHumanReadableTimeInfo(currentFileStore.lastModified)
}

const updateLastModified = () => (lastModified.value = getLastModified())
setInterval(updateLastModified, 500)
</script>

<template>
  <ShareUrlCreate />
  <ChannelView />
  <EditorSettings />
  <FullScreenPreview />
  <div id="editor-page">
    <div id="menu">
      <div id="menu-left-side">
        <EditorSandwichDropdown />
        <div id="button-menu">
          <button class="editor-button" @click="handleCopyButtonClick()">
            {{ copyButtonContent }}
          </button>
          <button
            v-if="!currentFileStore.shareFile"
            class="editor-button"
            @click="handleShareButtonClick()"
            v-tooltip="'Creates a URL to let others join your workspace'"
          >
            Share
          </button>
          <button class="editor-button" @click="handleDownloadButtonClick()">Download</button>
        </div>
        <SaveStateBadge />
      </div>
      <div id="menu-center">
        <div>
          <label for="file-name-input"></label>
          <!-- @vue-ignore We need the value property and TypeScript can't find it so we have to force it -->
          <input
            id="file-name-input"
            :disabled="currentFileStore.shareFile"
            v-model="currentFileStore.file.file_name"
            @input="event => currentFileStore.setFileName(event.target!.value)"
          />
        </div>
      </div>
      <div id="menu-right-side">
        <div>
          <p>
            Last edited:
            {{
              previewLoadingStore.previewLoading
                ? (updateLastModified() && false) || 'now'
                : lastModified
            }}
          </p>
        </div>
        <div>
          <button
            id="fullscreen-preview-button"
            class="editor-button"
            @click="handlePreviewButtonPress()"
          >
            Fullscreen
          </button>
        </div>
      </div>
    </div>
    <div id="editor-and-preview-wrapper">
      <FullScreenEditor v-if="viewState === FULL_SCREEN_EDITOR" @viewStateUpdate="_ => (viewState = DEFAULT_VIEW)"/>
      <FullScreenSlidesManager v-else-if="viewState === FULL_SCREEN_SLIDES_MANGER" @viewStateUpdate="_ => (viewState = DEFAULT_VIEW)" />
      <DefaultEditorSubView v-else @viewStateUpdate="payload => (viewState = payload)"/>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/core/mixins/link-hover-presets' as *;
@use '@/assets/core/mixins/view-presets' as *;
@use '@/assets/core/mixins/align-center' as *;
@use '@/assets/core/var' as var;

$left-menu-width: calc(40vw - 0.5rem);
$center-menu-width: 20vw;
$right-menu-width: calc(40vw - 0.5rem);
$total-width: 100vw;

@mixin menu-child-presets {
  display: flex;
  margin: 0;
  padding: 0;
}

div#editor-page {
  @include view-presets;

  #menu {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    padding: var.$editor-menu-padding;
    margin: var.$editor-menu-margin;
    height: 2rem;

    p {
      height: 1rem;
    }

    #menu-left-side {
      @include menu-child-presets;
      width: $left-menu-width;

      #button-menu {
        display: flex;
        flex-flow: row nowrap;
        padding: var.$editor-menu-button-menu-padding;
        margin: var.$editor-menu-button-menu-margin;
      }
    }

    #menu-center {
      @include menu-child-presets;
      width: $center-menu-width;
      justify-content: center;
      align-content: center;

      div {
        @include align-center;

        #file-name-input {
          border: none;
          background-color: transparent;
          text-align: center;
          width: 100%;
          height: calc(100% - 2px);
          padding: 0;
          margin: 0;

          &:focus {
            outline: var.$scheme-link-hover-color solid 2px;
            border-radius: 2px;
          }
        }
      }
    }

    #menu-right-side {
      @include menu-child-presets;
      width: $right-menu-width;
      justify-content: flex-end;

      div {
        @include align-center;
      }

      #fullscreen-preview-button {
        border: none;
        text-align: center;
        width: 100%;
        height: calc(100% - 2px);
        margin: 0 0 0 0.25rem;

        &:focus {
          outline: var.$scheme-cs-1 solid 2px;
        }
      }
    }
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
