<script setup lang="ts">
import { useFullScreenPreviewStore } from '@/stores/full-screen-preview'
import CloseButtonSVG from '@/components/icons/CloseButtonSVG.vue'
import LoadAnywayButton from '@/components/LoadAnywayButton.vue'
import { useInitStateStore } from '@/stores/init-state'
import OpenFullscreenSVG from '@/components/icons/OpenFullscreenSVG.vue'
import { ref } from 'vue'
import CloseFullscreenSVG from '@/components/icons/CloseFullscreenSVG.vue'
import { useRenderDataStore } from '@/stores/render-data'

const fullScreenPreviewStore = useFullScreenPreviewStore()
const initStateStore = useInitStateStore()
const renderData = useRenderDataStore()

let fillWholeScreen = ref(false)
function toggleFillWholeScreen() {
  const preview = document.getElementById('full-screen-preview')
  if (preview) {
    fillWholeScreen.value = preview.classList.toggle('fill-whole-screen')
  }
}
</script>

<template>
  <div id="full-screen-preview-wrapper" v-if="fullScreenPreviewStore.fullScreenPreview">
    <button id="close-button" @click="fullScreenPreviewStore.setFullScreenPreview(false)">
      <CloseButtonSVG />
    </button>
    <button id="toggle-fill-whole-screen" @click="toggleFillWholeScreen()">
      <OpenFullscreenSVG v-if="!fillWholeScreen" />
      <CloseFullscreenSVG v-else />
    </button>
    <div id="full-screen-preview">
      <div id="msg-wrapper" v-if="initStateStore.init">
        <p id="preview-not-loadable-msg">
          Modify source code before previewing fullscreen presentation
        </p>
        <LoadAnywayButton color-mode="dark" />
      </div>
      <iframe v-else :src="renderData.previewURL"></iframe>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/var' as var;
@use '@/assets/core/mixins/align-center' as *;

#full-screen-preview-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;

  // Blurred out background
  background-color: rgba(0, 0, 0, 0.5);

  #close-button {
    position: fixed;
    top: 4rem;
    right: 4rem;
    z-index: 101;

    svg {
      width: 2rem;
      height: 2rem;
      fill: white;
    }
  }

  #toggle-fill-whole-screen {
    position: fixed;
    top: 7rem;
    right: 4rem;
    z-index: 101;

    svg {
      width: 2rem;
      height: 2rem;
      fill: white;
    }
  }

  #full-screen-preview {
    $margin: 2rem;

    // The preview is on top of the normal editor page
    position: fixed;
    top: $margin;
    left: $margin;
    width: calc(100vw - $margin * 2);
    height: calc(100vh - $margin * 2);
    border: none;

    &.fill-whole-screen {
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
    }

    iframe {
      width: inherit;
      height: inherit;
      border: none;
    }

    #msg-wrapper {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 100;

      // Align everything center
      @include align-center;
      flex-direction: column;

      #preview-not-loadable-msg {
        font-size: 2rem;
        color: white;
        margin: 0 0 2rem 0;
      }
    }

    #close-full-screen-preview {
      position: fixed;
      top: 0;
      right: 0;
      z-index: 100;
      width: 2rem;
      height: 2rem;
      margin: 0;
      padding: 0;
      border: none;
      background-color: transparent;
      cursor: pointer;
    }
  }
}
</style>
