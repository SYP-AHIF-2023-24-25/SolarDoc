<script setup lang="ts">
import AsciidocIcon from '@/components/icons/AsciidocIcon.vue'
import EditorSandwichDropdown from '@/components/editor/dropdown/EditorSandwichDropdown.vue'
import SaveStateBadge from '@/components/editor/SaveStateBadge.vue'
import { useOverlayStateStore } from '@/stores/overlay-state'
import { useCurrentFileStore } from '@/stores/current-file'
import LastModified from '@/components/editor/editor-navbar/LastModified.vue'
import PresentationIconDarkModeSVG from '@/components/icons/PresentationIconDarkModeSVG.vue'
import PresentationIconSVG from '@/components/icons/PresentationIconSVG.vue'
import { useDarkModeStore } from '@/stores/dark-mode'
import ViewPrintableDropdown from '@/components/editor/editor-navbar/ViewInOtherWindowDropdown.vue'
import ContributorsCount from '@/components/editor/ContributorsCount.vue'
import SaveIconDarkModeSVG from '@/components/icons/SaveIconDarkModeSVG.vue'
import SaveIconSVG from '@/components/icons/SaveIconSVG.vue'
import {useCurrentUserStore} from "@/stores/current-user";
import {interceptErrors} from "@/errors/handler/error-handler";
import {ensureLoggedIn} from "@/scripts/ensure-logged-in";
import {useRouter} from "vue-router";
import {showInfoNotifFromObj} from "@/scripts/show-notif";
import constants from "@/plugins/constants";

const $router = useRouter()

const overlayStateStore = useOverlayStateStore()
const currentFileStore = useCurrentFileStore()
const currentUserStore = useCurrentUserStore()
const darkModeStore = useDarkModeStore()

// Enable loading spinner for preview if the button is clicked
function handlePreviewButtonPress() {
  overlayStateStore.setFullScreenPreview(true)
}

async function handleSaveButtonPress() {
  await interceptErrors(
    ensureLoggedIn($router).then(
      async () => await currentFileStore.storeOnServer(currentUserStore.bearer!),
    ),
  )
  showInfoNotifFromObj(constants.notifMessages.fileSaved)
}
</script>

<template>
  <div id="editor-navbar">
    <div id="menu-left-side">
      <div>
        <EditorSandwichDropdown />
        <div id="file-name-input-wrapper">
          <span id="asciidoc-icon"><AsciidocIcon /></span>
          <label for="file-name-input"></label>
          <!-- @vue-ignore We need the value property and TypeScript can't find it so we have to force it -->
          <input
            id="file-name-input"
            :disabled="currentFileStore.shareFile"
            v-model="currentFileStore.file.file_name"
            @input="
              event => {
                currentFileStore.setFileName(event.target!.value)
                currentFileStore.setIsFileNameUpdated(true)
              }
            "
          />
          <span
            v-if="currentFileStore.isFileNameUpdated && currentFileStore.remoteFile"
            id="file-name-save-button"
            v-tooltip="'Save the changed file name'"
            @click="handleSaveButtonPress"
          >
            <SaveIconDarkModeSVG v-show="darkModeStore.darkMode" />
            <SaveIconSVG v-show="!darkModeStore.darkMode" />
          </span>
        </div>
      </div>
      <div id="phone-save-state-badge">
        <SaveStateBadge />
      </div>
    </div>
    <div id="menu-right-side">
      <div>
        <SaveStateBadge />
        <ContributorsCount v-if="currentFileStore.remoteFile" />
        <LastModified />
      </div>
      <div id="right-side-icon-menu">
        <div>
          <ViewPrintableDropdown />
        </div>
        <div @click="handlePreviewButtonPress()">
          <button class="sandwich-button no-colorful-hover">
            <PresentationIconDarkModeSVG v-show="darkModeStore.darkMode" />
            <PresentationIconSVG v-show="!darkModeStore.darkMode" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/mixins/link-hover-presets' as *;
@use '@/assets/core/mixins/view-presets' as *;
@use '@/assets/core/mixins/align-center' as *;
@use '@/assets/core/mixins/screen-size' as *;
@use '@/assets/core/mixins/hide' as *;
@use '@/assets/core/var' as var;

$left-menu-width: calc(40vw - 0.5rem);
$right-menu-width: calc(35vw - 8px);
$menu-height: 2rem;
$total-width: 100vw;

@mixin menu-child-presets {
  display: flex;
  margin: 0;
  padding: 0;
}

#editor-navbar {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  padding: var.$editor-menu-padding;
  margin: var.$editor-menu-margin;
  height: $menu-height;
  width: 100%;
  white-space: nowrap;
  overflow: visible;

  p {
    height: 1rem;
  }

  #menu-left-side {
    @include menu-child-presets;
    display: flex;
    width: $total-width;
    justify-content: space-between;

    #phone-save-state-badge {
      @include show-that-respects-svg();
      margin-right: 0.5rem;
    }

    @include r-min(var.$window-medium) {
      width: $left-menu-width;

      #phone-save-state-badge {
        @include hide-that-respects-svg();
      }
    }

    & > div:first-child {
      display: flex;
      width: max-content;

      #file-name-input-wrapper {
        display: flex;
        align-content: center;
        justify-content: center;
        position: relative;
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

        #file-name-save-button {
          @include align-center;
          height: calc(100% - 0.4rem);
          width: 1.5rem;
          border-radius: 0.25rem;
          padding: 2px;
          margin: 0.2rem 0.15rem 0.1rem 0.15rem;

          &:hover {
            cursor: pointer;
            background-color: var.$scheme-gray-400;
          }
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

        &,
        * {
          outline: transparent;
        }

        &:has(#file-name-input:focus),
        &:hover {
          background: var.$scheme-interactive-element-background-color-highlighted;
        }
      }
    }
  }

  #menu-right-side {
    @include menu-child-presets;
    @include hide-that-respects-svg();
    justify-content: space-between;

    @include r-min(var.$window-medium) {
      @include show-that-respects-svg();
      width: $right-menu-width;
    }

    div {
      @include align-center;

      &:first-child {
        display: flex;
        gap: 0.5rem;
      }

      &:last-child {
        justify-content: flex-end;

        button {
          @include align-center;
          padding: 0.3rem;
          margin: 0;
          box-sizing: border-box;
        }
      }
    }

    #fullscreen-preview-button {
      border: none;
      text-align: center;
      width: 100%;
      height: calc(100% - 2px);
      margin: 0;

      &:focus {
        outline: var.$scheme-cs-1 solid 2px;
      }
    }
  }
}
</style>
