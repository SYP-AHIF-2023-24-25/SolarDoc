<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useDarkModeStore } from '@/stores/dark-mode'
import { usePreviewLoadingStore } from '@/stores/preview-loading'
import { usePreviewSelectedSlideStore } from '@/stores/preview-selected-slide'
import { useInitStateStore } from '@/stores/init-state'
import { useOverlayStateStore } from '@/stores/overlay-state'
import { handleCopy } from '@/scripts/handle-copy'
import { useRenderDataStore } from '@/stores/render-data'
import { useEditorUpdateWSClient } from '@/stores/editor-update-ws-client'
import { useCurrentUserStore } from '@/stores/current-user'
import { useCurrentFileStore } from '@/stores/current-file'
import { getHumanReadableTimeInfo } from '@/scripts/format-date'
import Editor from '@/components/editor/Editor.vue'
import SlidesNavigator from '@/components/slides-navigator/SlidesNavigator.vue'
import SubSlidesNavigator from '@/components/sub-slides-navigator/SubSlidesNavigator.vue'
import FullScreenPreview from '@/components/FullScreenPreview.vue'
import LoadAnywayButton from '@/components/LoadAnywayButton.vue'
import EditorSandwichDropdown from '@/components/editor/dropdown/EditorSandwichDropdown.vue'
import ChannelView from '@/components/editor/channel-view/ChannelView.vue'
import ShareUrlCreate from '@/components/editor/share-url/ShareUrlCreate.vue'
import * as backendAPI from '@/services/render/api-service'
import * as phoenixBackend from '@/services/phoenix/api-service'
import { SDSCLIENT_URL } from '@/services/phoenix/config'
import { showWelcomeIfNeverShownBefore } from '@/scripts/show-welcome'
import { interceptErrors } from '@/errors/error-handler'
import { showWarnNotif } from '@/scripts/show-notif'
import { Permissions } from '@/stores/current-file'
import constants from "@/plugins/constants";

const darkModeStore = useDarkModeStore()
const previewLoadingStore = usePreviewLoadingStore()
const initStateStore = useInitStateStore()
const overlayStateStore = useOverlayStateStore()
const renderDataStore = useRenderDataStore()
const previewSelectedSlideStore = usePreviewSelectedSlideStore()
const currentUserStore = useCurrentUserStore()
const currentFileStore = useCurrentFileStore()
const editorUpdateWSClient = useEditorUpdateWSClient()

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
    await phoenixBackend.ensurePhoenixBackendIsReachable()
    const authStatus =
      currentUserStore.loggedIn && (await currentUserStore.ensureAuthNotExpiredOrRevoked())
    if (authStatus === 'authenticated') {
      // Ensure that the user has the permissions to open the current file
      currentFileStore.ensureUserIsAuthorisedForFile(currentUserStore.currentUser!.id)

      console.log('[Editor] Attempting to connect to SDS')
      editorUpdateWSClient.createWSClient(SDSCLIENT_URL, currentUserStore.currentAuth?.token)
    } else if (authStatus === 'expired-or-revoked') {
      await currentUserStore.logout()
      currentFileStore.closeFile()
    } else if (authStatus === 'unreachable' || authStatus === 'unknown') {
      showWarnNotif('Warning', 'Could not verify authentication status. Please reload the page.')
    } else {
      console.log('[Editor] Skipping connection to SDS. Not logged in!')
    }
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
          >
            Share
          </button>
          <button class="editor-button" @click="handleDownloadButtonClick()">Download</button>
        </div>
        <div id="save-state">
          <p
            :class="currentFileStore.saveState === constants.saveStates.server ? 'saved' : 'error'"
          >{{ currentFileStore.saveState }}</p>
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
            class="editor-button"
            id="fullscreen-preview-button"
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
          <div id="init-msg-wrapper" v-if="initStateStore.init">
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
          id="preview-meta-info"
          class="loading"
          v-if="previewLoadingStore.previewLoading && !initStateStore.init"
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
        <div id="preview-meta-info" v-else>
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

<style scoped lang="scss">
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
        font-size: 0.8rem;

        & > p {
          @include align-center;
          height: 1.5rem;
          color: var.$scheme-gray-600;

          padding: 0 0.25rem;
          @media screen and (min-width: var.$window-large) {
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

      // Overflow if the content is too large on the y-axis
      overflow: hidden scroll;

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

            @media screen and (min-width: var.$window-large) {
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
