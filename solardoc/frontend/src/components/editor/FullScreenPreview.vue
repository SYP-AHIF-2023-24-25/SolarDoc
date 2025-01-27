<script setup lang="ts">
import { ref } from 'vue'
import { useOverlayStateStore } from '@/stores/overlay-state'
import { useInitStateStore } from '@/stores/init-state'
import { useRenderDataStore } from '@/stores/render-data'
import CloseButtonSVG from '@/components/icons/CloseButtonSVG.vue'
import LoadAnywayButton from '@/components/editor/LoadAnywayButton.vue'
import OpenFullscreenSVG from '@/components/icons/OpenFullscreenSVG.vue'
import CloseFullscreenSVG from '@/components/icons/CloseFullscreenSVG.vue'

const overlayStateStore = useOverlayStateStore()
const initStateStore = useInitStateStore()
const renderData = useRenderDataStore()

let fillWholeScreen = ref(false)

function toggleFillWholeScreen() {
  fillWholeScreen.value = !fillWholeScreen.value
}
</script>

<template>
  <div
    id="full-screen-wrapper"
    :class="
      'blurred-background-full-screen-overlay ' + (fillWholeScreen ? 'fill-whole-screen' : '')
    "
    v-if="overlayStateStore.fullScreenPreview"
  >
    <button id="close-button" @click="overlayStateStore.setFullScreenPreview(false)">
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
@use '@/assets/full-screen-overlay' as *;

#full-screen-wrapper {
  --margin: 2rem;
  --base-offset: calc(40px + var(--margin));
  --top-offset: calc(1.5 * var(--base-offset));

  #close-button,
  #toggle-fill-whole-screen {
    right: var(--base-offset);
  }

  #close-button {
    position: fixed;
    top: var(--top-offset);
    z-index: 101;

    svg {
      width: 2rem;
      height: 2rem;
      fill: #ea71b7;
    }
  }

  #toggle-fill-whole-screen {
    position: fixed;
    top: calc(var(--top-offset) + 3rem);
    z-index: 101;

    svg {
      width: 2rem;
      height: 2rem;
      fill: #ea71b7;
    }
  }

  &.fill-whole-screen {
    --margin: 0px;

    #full-screen-preview {
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
    }
  }

  #full-screen-preview {
    // The preview is on top of the normal editor page
    position: fixed;
    top: var(--margin);
    left: var(--margin);
    width: calc(100vw - var(--margin) * 2);
    height: calc(100vh - var(--margin) * 2);
    border: none;

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
