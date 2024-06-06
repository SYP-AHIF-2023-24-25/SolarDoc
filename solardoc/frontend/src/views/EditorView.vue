<script lang="ts" setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useDarkModeStore } from '@/stores/dark-mode'
import { usePreviewLoadingStore } from '@/stores/preview-loading'
import { usePreviewSelectedSlideStore } from '@/stores/preview-selected-slide'
import { useInitStateStore } from '@/stores/init-state'
import { useOverlayStateStore } from '@/stores/overlay-state'
import { handleCopy } from '@/scripts/handle-copy'
import { useRenderDataStore } from '@/stores/render-data'
import { useCurrentUserStore } from '@/stores/current-user'
import { Permissions, useCurrentFileStore } from '@/stores/current-file'
import { getHumanReadableTimeInfo } from '@/scripts/format-date'
import Editor from '@/components/editor/Editor.vue'
import SlidesNavigator from '@/components/slides-navigator/SlidesNavigator.vue'
import SubSlidesNavigator from '@/components/sub-slides-navigator/SubSlidesNavigator.vue'
import FullScreenPreview from '@/components/FullScreenPreview.vue'
import LoadAnywayButton from '@/components/LoadAnywayButton.vue'
import EditorSandwichDropdown from '@/components/editor/dropdown/EditorSandwichDropdown.vue'
import ChannelView from '@/components/editor/dropdown/current-channel/CurrentChannelWrapper.vue'
import ShareUrlCreate from '@/components/editor/dropdown/share-url/ShareUrlCreate.vue'
import * as backendAPI from '@/services/render/api-service'
import * as phoenixBackend from '@/services/phoenix/api-service'
import { showWelcomeIfNeverShownBefore } from '@/scripts/show-welcome'
import { interceptErrors } from '@/errors/handler/error-handler'
import constants from '@/plugins/constants'
import EditorSettings from '@/components/editor/dropdown/editor-settings/EditorSettings.vue'
import { createEditorRemoteFileConnection } from '@/scripts/editor/file'
import { useLoadingStore } from '@/stores/loading'

const darkModeStore = useDarkModeStore()
const previewLoadingStore = usePreviewLoadingStore()
const initStateStore = useInitStateStore()
const overlayStateStore = useOverlayStateStore()
const renderDataStore = useRenderDataStore()
const previewSelectedSlideStore = usePreviewSelectedSlideStore()
const currentUserStore = useCurrentUserStore()
const currentFileStore = useCurrentFileStore()
const loadingStore = useLoadingStore()

const { rawSize, slideCount, slideCountInclSubslides, previewURL } = storeToRefs(renderDataStore)
const { slideIndex, subSlideIndex } = storeToRefs(previewSelectedSlideStore)

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
            v-if="currentFileStore.permissions === Permissions.Unknown"
            class="editor-button"
            @click="handleShareButtonClick()"
            v-tooltip="'Creates a URL to let others join your workspace'"
          >
            Share
          </button>
          <button class="editor-button" @click="handleDownloadButtonClick()">Download</button>
        </div>
        <div
          id="save-state"
          v-tooltip="'Indicates whether the file is saved remotely on the server'"
        >
          <p
            :class="currentFileStore.saveState === constants.saveStates.server ? 'saved' : 'error'"
          >
            {{ currentFileStore.saveState }}
          </p>
        </div>
      </div>
      <div id="menu-center">
        <div>
          <label for="file-name-input"></label>
          <!-- @vue-ignore We need the value property and TypeScript can't find it so we have to force it -->
          <input
            id="file-name-input"
            v-model="currentFileStore.fileName"
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
      <div id="editor-wrapper">
        <Editor></Editor>
      </div>
      <div id="preview-wrapper">
        <div id="preview">
          <div v-if="initStateStore.init" id="init-msg-wrapper">
            <p id="init-msg">Start typing and see preview!</p>
            <LoadAnywayButton :color-mode="darkModeStore.darkMode ? 'dark' : 'light'" />
          </div>
          <h2
            v-else-if="(previewLoadingStore.previewLoading && !initStateStore.init) || !previewURL"
          >
            <span class="dot-dot-dot-flashing"></span>
          </h2>
          <iframe
            v-else
            :src="`${previewURL}?static=true#${slideIndex}/${(subSlideIndex ?? -1) + 1}`"
          ></iframe>
        </div>
        <div
          v-if="previewLoadingStore.previewLoading && !initStateStore.init"
          id="preview-meta-info"
          class="loading"
        >
          <div>
            <div class="dot-dot-dot-flashing-mini"></div>
            <p>slides (</p>
            <div class="dot-dot-dot-flashing-mini"></div>
            <p>Subslides)</p>
          </div>
          <div>
            <div class="dot-dot-dot-flashing-mini"></div>
            <p>KB Raw Size</p>
          </div>
        </div>
        <div v-else id="preview-meta-info">
          <p>
            {{ slideCount ? slideCount! : '?' }} {{ slideCount == 1 ? 'slide' : 'slides' }} ({{
              slideCount && slideCountInclSubslides ? slideCountInclSubslides - slideCount : '?'
            }}
            {{
              (slideCountInclSubslides ?? 0) - (slideCount ?? 0) == 1 ? 'subslide' : 'subslides'
            }})
          </p>
          <p>{{ rawSize ? Math.round(rawSize! * 100) / 100 : '?' }} KB Raw Size</p>
        </div>
        <div id="slides-navigator-wrapper">
          <SlidesNavigator></SlidesNavigator>
        </div>
        <div id="sub-slides-navigator-wrapper">
          <SubSlidesNavigator></SubSlidesNavigator>
        </div>
      </div>
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

      #sandwich-menu-button {
        // TODO!
      }

      #button-menu {
        display: flex;
        flex-flow: row nowrap;
        padding: var.$editor-menu-button-menu-padding;
        margin: var.$editor-menu-button-menu-margin;
      }

      #save-state {
        @include align-center;
        display: flex;
        flex-flow: row nowrap;
        height: 100%;
        max-width: 100%;
        font-size: 0.8rem;

        & > p {
          @include align-center;
          height: 1.5rem;
          color: var.$scheme-gray-600;
          max-width: 100%;
          white-space: nowrap;
          overflow: hidden;

          padding: 0 0.25rem;
          @media screen and (min-width: var.$window-xlarge) {
            & {
              padding: 2px 0.5rem 0;
            }
          }

          background-color: var.$scheme-gray-300;
          border-radius: 2px;

          &.saved {
            background-color: var.$save-state-background-saved;
            color: white;
          }

          &.error {
            background-color: var.$save-state-background-error;
            color: white;
          }

          &.not-saved {
            background-color: var.$save-state-background-not-saved;
            color: white;
          }
        }
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

    #editor {
      display: flex;
      flex-flow: column nowrap;
      width: var.$editor-monaco-width;
      height: var.$editor-monaco-height;
      padding-top: var.$editor-monaco-padding-top;
    }

    #editor-wrapper {
      border-right: var.$editor-border;
    }

    #preview-wrapper {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      height: var.$editor-preview-menu-height;
      overflow: hidden;

      #preview-meta-info {
        @include align-center();
        flex-flow: row nowrap;
        height: var.$editor-preview-meta-info-height;
        padding: var.$editor-preview-meta-info-padding;
        min-height: var.$editor-preview-meta-info-height;
        border-bottom: var.$editor-border;
        justify-content: space-between;

        &.loading div {
          @include align-center();
          display: flex;
          flex-flow: row nowrap;

          .dot-dot-dot-flashing-mini {
            margin-right: 0.75rem;

            &:nth-of-type(2) {
              margin: 0 0.75rem 0 0.75rem;
            }
          }
        }
      }

      #slides-navigator-wrapper {
        padding: 0;
        margin: 0;
        height: var.$editor-preview-slides-navigator-height;
        border-bottom: var.$editor-border;
      }

      #sub-slides-navigator-wrapper {
        flex-grow: 1;
      }

      #preview {
        @include align-center();
        margin: 0;
        padding: 0;
        border-bottom: var.$editor-border;
        width: var.$editor-preview-frame-width;
        height: var.$editor-preview-frame-height;
        min-width: var.$editor-preview-frame-width;
        min-height: var.$editor-preview-frame-height;

        #init-msg-wrapper {
          @include align-center();
          flex-direction: column;

          #init-msg {
            margin: 0.5rem 0.5rem 2rem 0.5rem;

            // Change font size depending on the screen width
            font-size: 1.2rem;

            @media screen and (min-width: var.$window-xlarge) {
              & {
                font-size: 2rem;
              }
            }
          }
        }

        iframe {
          border: none;
          width: 100%;
          height: 100%;
        }
      }
    }
  }
}
</style>
