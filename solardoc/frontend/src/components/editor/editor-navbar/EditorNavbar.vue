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

const overlayStateStore = useOverlayStateStore()
const currentFileStore = useCurrentFileStore()
const darkModeStore = useDarkModeStore()

// Enable loading spinner for preview if the button is clicked
function handlePreviewButtonPress() {
  overlayStateStore.setFullScreenPreview(true)
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
            id="file-name-star"
            v-if="currentFileStore.isFileNameUpdated"
            v-tooltip="'This file name has been modified'"
            >*</span
          >
        </div>
      </div>
      <div id="phone-save-state-badge">
        <SaveStateBadge />
      </div>
    </div>
    <div id="menu-right-side">
      <div>
        <SaveStateBadge />
        <LastModified />
      </div>
      <div @click="handlePreviewButtonPress()">
        <span>
          <PresentationIconDarkModeSVG v-show="darkModeStore.darkMode" />
          <PresentationIconSVG v-show="!darkModeStore.darkMode" />
        </span>
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
      @include show-that-respects-svg;
      margin-right: 0.5rem;
    }

    @include r-min(var.$window-medium) {
      width: $left-menu-width;

      #phone-save-state-badge {
        @include hide-that-respects-svg;
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

        #file-name-star {
          position: absolute;
          right: 0.5rem;
          padding: 0.22rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.85em;
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
          background: var.$scheme-file-name-input-background-color-highlighted;
        }
      }
    }
  }

  #menu-right-side {
    @include menu-child-presets;
    @include hide-that-respects-svg;
    justify-content: space-between;

    @include r-min(var.$window-medium) {
      @include show-that-respects-svg;
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

        span {
          @include align-center;
          height: 100%;
          width: 1.7rem;
          margin: 0 0 0 0.1rem;
          padding: 0 0.25rem;
          box-sizing: border-box;

          &:hover {
            cursor: pointer;
            background: var.$scheme-file-name-input-background-color-highlighted;
          }
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
