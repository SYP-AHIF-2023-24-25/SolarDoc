<script setup lang="ts">
import LoadAnywayButton from "@/components/editor/LoadAnywayButton.vue";
import {usePreviewLoadingStore} from "@/stores/preview-loading";
import {useDarkModeStore} from "@/stores/dark-mode";
import {useInitStateStore} from "@/stores/init-state";
import {useRenderDataStore} from "@/stores/render-data";
import {usePreviewSelectedSlideStore} from "@/stores/preview-selected-slide";
import {storeToRefs} from "pinia";
import ArrowRight from "@/components/icons/ArrowRight.vue";
import SlidesManagerSlidesNavigator
  from "@/components/editor/sub-views/full-screen-slides-manager/slides-navigator/SlidesManagerSlidesNavigator.vue";
import SlidesManagerSubSlidesNavigator
  from "@/components/editor/sub-views/full-screen-slides-manager/sub-slides-navigator/SlidesManagerSubSlidesNavigator.vue";

const previewLoadingStore = usePreviewLoadingStore()
const darkModeStore = useDarkModeStore()
const initStateStore = useInitStateStore()
const renderDataStore = useRenderDataStore()
const previewSelectedSlideStore = usePreviewSelectedSlideStore()

const { rawSize, slideCount, slideCountInclSubslides, previewURL } = storeToRefs(renderDataStore)
const { slideIndex, subSlideIndex } = storeToRefs(previewSelectedSlideStore)
</script>

<template>
  <div id="slides-manager-wrapper">
    <div id="change-view-buttons">
      <div id="change-layout-to-default" @click="$emit('viewStateUpdate')">
        <ArrowRight />
      </div>
    </div>
    <div id="slides-manager">
      <div id="slides-navigator-wrapper">
        <SlidesManagerSlidesNavigator />
      </div>
      <div id="preview-and-subslides-navigator-wrapper">
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
        <div id="sub-slides-navigator-wrapper">
          <SlidesManagerSubSlidesNavigator/>
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

#slides-manager-wrapper {
  display: flex;
  flex-flow: row nowrap;
  height: var.$editor-monaco-and-preview-menu-height;
  width: calc(100vw - var(--scrollbar-width));
  max-width: 100vw;
  position: relative;
  box-sizing: border-box;

  #change-view-buttons {
    position: absolute;
    top: calc(var(--editor-preview-frame-height) - 4rem);
    left: 0;
    width: 1rem;
    height: 3rem;
    z-index: 10;

    #change-layout-to-default {
      display: flex;
      flex-direction:row;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 0;
      left: 0;
      width: 2rem;
      height: 4rem;
      background-color: rgba(#e5e7eb, .5);
      opacity: 0.9;
      border-radius: 0 5rem 5rem 0;

      &:hover {
        background-color: rgba(#e5e7eb, .9);
        cursor: pointer;
      }
    }
  }

  #slides-manager {
    display: flex;
    flex-flow: row nowrap;

    #slides-navigator-wrapper {
      display: flex;
      flex-flow: column nowrap;
      height: var.$editor-slides-manager-slides-preview-height;
      width: var.$editor-slides-manager-slides-preview-width;
      padding: 0;
      margin: 0;
      border-right: var.$editor-border;
    }

    #preview-and-subslides-navigator-wrapper {
      display: flex;
      flex-flow: column nowrap;
      height: var.$editor-slides-manager-preview-and-sub-slides-navigator-height;
      width: var.$editor-slides-manager-preview-and-sub-slides-navigator-width;

      #preview-wrapper {
        @include align-center();
        display: flex;
        flex-flow: column nowrap;
        overflow: hidden;
        height: var.$editor-slides-manager-preview-height;
        width: var.$editor-slides-manager-preview-width;
        border-bottom: var.$editor-border;

        #preview {
          @include align-center();
          margin: 0;
          padding: 0;
          width: var.$editor-slides-manager-preview-frame-width;
          height: var.$editor-slides-manager-preview-frame-height;
          min-width: var.$editor-slides-manager-preview-frame-width;
          min-height: var.$editor-slides-manager-preview-frame-height;

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
            border-radius: 1rem;
          }
        }
      }

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

      #sub-slides-navigator-wrapper {
        display: flex;
        height: var.$editor-slides-manager-sub-slides-navigator-height;
        width: var.$editor-slides-manager-sub-slides-navigator-width;
        max-height: var.$editor-slides-manager-sub-slides-navigator-height;
        max-width: var.$editor-slides-manager-sub-slides-navigator-width;
      }
    }
  }
}
</style>
