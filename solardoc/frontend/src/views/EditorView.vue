<script lang="ts" setup>
import { ref } from 'vue'
import { usePreviewLoadingStore } from '@/stores/preview-loading'
import { useOverlayStateStore } from '@/stores/overlay-state'
import { useCurrentUserStore } from '@/stores/current-user'
import { useCurrentFileStore } from '@/stores/current-file'
import { getHumanReadableTimeInfo } from '@/scripts/format-date'
import FullScreenPreview from '@/components/editor/FullScreenPreview.vue'
import EditorSandwichDropdown from '@/components/editor/dropdown/EditorSandwichDropdown.vue'
import ChannelView from '@/components/editor/dropdown/current-channel/CurrentChannelWrapper.vue'
import ShareUrlCreate from '@/components/editor/dropdown/share-url/ShareUrlCreate.vue'
import Export from '@/components/editor/export/Export.vue'
import * as backendAPI from '@/services/render/api-service'
import * as phoenixBackend from '@/services/phoenix/api-service'
import { showWelcomeIfNeverShownBefore } from '@/scripts/show-welcome'
import { interceptErrors } from '@/errors/handler/error-handler'
import EditorSettings from '@/components/editor/dropdown/editor-settings/EditorSettings.vue'
import { createEditorRemoteFileConnection } from '@/scripts/editor/file'
import { useLoadingStore } from '@/stores/loading'
import SaveStateBadge from '@/components/editor/SaveStateBadge.vue'
import DefaultEditorSubView from '@/components/editor/sub-views/default/DefaultEditorSubView.vue'
import FullScreenEditor from '@/components/editor/sub-views/full-screen-editor/FullScreenEditor.vue'
import FullScreenSlidesManager from '@/components/editor/sub-views/full-screen-slides-manager/FullScreenSlidesManager.vue'
import {
  DEFAULT_VIEW,
  FULL_SCREEN_EDITOR,
  FULL_SCREEN_SLIDES_MANGER,
} from '@/scripts/editor/sub-view-state'
import AsciidocIcon from "@/components/icons/AsciidocIcon.vue";
import ContributorsCount from "@/components/editor/ContributorsCount.vue";

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
  <EditorSettings />
  <Export />
  <div id="editor-page">
    <div id="menu">
      <div id="menu-left-side">
        <EditorSandwichDropdown />
        <div id="file-name-input-wrapper">
          <span id="asciidoc-icon"><AsciidocIcon /></span>
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
          <SaveStateBadge />
          <ContributorsCount/>
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
      <FullScreenEditor
        v-if="viewState === FULL_SCREEN_EDITOR"
        @viewStateUpdate="_ => (viewState = DEFAULT_VIEW)"
      />
      <FullScreenSlidesManager
        v-else-if="viewState === FULL_SCREEN_SLIDES_MANGER"
        @viewStateUpdate="_ => (viewState = DEFAULT_VIEW)"
      />
      <DefaultEditorSubView v-else @viewStateUpdate="payload => (viewState = payload)" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/core/mixins/link-hover-presets' as *;
@use '@/assets/core/mixins/view-presets' as *;
@use '@/assets/core/mixins/align-center' as *;
@use '@/assets/core/var' as var;

$left-menu-width: calc(40vw - 0.5rem);
$right-menu-width: calc(35vw - 8px);
$total-width: 100vw;

@mixin menu-child-presets {
  display: flex;
  margin: 0;
  padding: 0;
}

$menu-height: 2rem;

div#editor-page {
  @include view-presets;

  #menu {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    padding: var.$editor-menu-padding;
    margin: var.$editor-menu-margin;
    height: $menu-height;

    p {
      height: 1rem;
    }

    #menu-left-side {
      @include menu-child-presets;
      width: $left-menu-width;

      #file-name-input-wrapper {
        display: flex;
        align-content: center;
        justify-content: center;
        height: $menu-height;
        box-sizing: border-box;
        background-color: var.$scheme-file-name-input-background-color;
        box-shadow: 0 -2px var.$scheme-link-hover-color inset;
        border-radius: 0.3em 0.3em 0 0;
        margin-left: 4px;

        #asciidoc-icon {
          display: inline-flex;
          align-content: center;
          justify-content: center;
          flex-direction: column;
          height: 100%;
          margin: 0 0.5rem;
        }

        ::selection {
          background-color: var.$scheme-file-name-input-background-color-selection;
        }

        #file-name-input {
          height: inherit;
          box-sizing: border-box;
          border: none;
          text-align: left;
          width: fit-content;
          padding: var.$editor-menu-file-name-padding;
          margin: var.$editor-menu-file-name-margin;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.85em;
          background: transparent;
        }

        &, * {
          outline: transparent;
        }

        &:has(#file-name-input:focus),
        &:hover {
          background: var.$scheme-file-name-input-background-color-highlighted;
        }
      }
    }

    #menu-right-side {
      @include menu-child-presets;
      width: $right-menu-width;
      justify-content: space-between;

      div {
        @include align-center;

        &:first-child {
          display: flex;
          gap: 0.5rem;
        }

        &:last-child {
          justify-content: flex-end;
        }
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
