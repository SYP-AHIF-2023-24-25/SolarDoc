<script setup lang="ts">
import Editor from '@/components/editor/Editor.vue'
import SubSlidesNavigator from '@/components/editor/sub-views/default/sub-slides-navigator/SubSlidesNavigator.vue'
import LoadAnywayButton from '@/components/editor/LoadAnywayButton.vue'
import SlidesNavigator from '@/components/editor/sub-views/default/slides-navigator/SlidesNavigator.vue'
import { useDarkModeStore } from '@/stores/dark-mode'
import { useInitStateStore } from '@/stores/init-state'
import { storeToRefs } from 'pinia'
import { useRenderDataStore } from '@/stores/render-data'
import { usePreviewSelectedSlideStore } from '@/stores/preview-selected-slide'
import { usePreviewLoadingStore } from '@/stores/preview-loading'
import ArrowLeft from '@/components/icons/ArrowLeft.vue'
import ArrowRight from '@/components/icons/ArrowRight.vue'
import { FULL_SCREEN_EDITOR, FULL_SCREEN_SLIDES_MANGER } from '@/scripts/editor/sub-view-state'
import { showDummyLoading } from '@/scripts/show-dummy-loading'

const previewLoadingStore = usePreviewLoadingStore()
const darkModeStore = useDarkModeStore()
const initStateStore = useInitStateStore()
const renderDataStore = useRenderDataStore()
const previewSelectedSlideStore = usePreviewSelectedSlideStore()

const { rawSize, slideCount, slideCountInclSubslides, previewURL } = storeToRefs(renderDataStore)
const { slideIndex, subSlideIndex } = storeToRefs(previewSelectedSlideStore)

</script>

<template>
  <div id="default-editor-sub-view">
    <div id="editor-wrapper">
      <Editor></Editor>
    </div>
    <div id="change-view-buttons">
      <div
        id="change-layout-to-slides-manager-button"
        @click="
          _ => {
            $emit('viewStateUpdate', FULL_SCREEN_SLIDES_MANGER)
            showDummyLoading()
          }
        "
      >
        <ArrowLeft />
      </div>
      <div
        id="change-layout-to-full-screen-editor-button"
        @click="
          _ => {
            $emit('viewStateUpdate', FULL_SCREEN_EDITOR)
            showDummyLoading()
          }
        "
      >
        <ArrowRight />
      </div>
    </div>
    <div id="preview-wrapper">
      <div id="preview">
        <div v-if="initStateStore.init" id="init-msg-wrapper">
          <p id="init-msg">Start typing and see preview!</p>
          <LoadAnywayButton :color-mode="darkModeStore.darkMode ? 'dark' : 'light'" />
        </div>
        <h2 v-else-if="(previewLoadingStore.previewLoading && !initStateStore.init) || !previewURL">
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
          {{ (slideCountInclSubslides ?? 0) - (slideCount ?? 0) == 1 ? 'subslide' : 'subslides' }})
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
</template>

<style scoped lang="scss">
@use '@/assets/core/mixins/link-hover-presets' as *;
@use '@/assets/core/mixins/view-presets' as *;
@use '@/assets/core/mixins/align-center' as *;
@use '@/assets/core/var' as var;

#default-editor-sub-view {
  display: flex;
  flex-flow: row nowrap;
  max-width: inherit;
  position: relative;

  #editor {
    display: flex;
    flex-flow: column nowrap;
    width: var.$editor-monaco-width;
    height: var.$editor-monaco-height;
    padding-top: var.$editor-monaco-padding-top;
  }

  #editor-wrapper {
    border-right: var.$editor-border;
    height: var.$editor-monaco-height;
  }

  #change-view-buttons {
    position: absolute;
    top: calc(var(--editor-preview-frame-height) - 4rem);
    left: calc(var(--editor-monaco-width));
    width: 1rem;
    height: 3rem;

    #change-layout-to-slides-manager-button,
    #change-layout-to-full-screen-editor-button {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 0;
      right: 0;
      width: 1.5rem;
      height: 3rem;
      background-color: rgba(#e5e7eb, 0.5);
      opacity: 0.9;

      &,
      * {
        color: var.$text-color;
      }

      &:hover {
        background-color: rgba(#e5e7eb, 0.9);
        cursor: pointer;
      }
    }

    #change-layout-to-slides-manager-button {
      left: calc(-1.5rem + 1px);
      border-radius: 5rem 0 0 5rem;
    }

    #change-layout-to-full-screen-editor-button {
      left: 0;
      border-radius: 0 5rem 5rem 0;
    }
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
</style>
