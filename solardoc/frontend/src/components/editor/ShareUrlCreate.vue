<script setup lang="ts">
import type {Vueform} from "@vueform/vueform";
import {useOverlayStateStore} from "@/stores/overlay-state";
import CloseButtonSVG from "@/components/icons/CloseButtonSVG.vue"

const overlayStateStore = useOverlayStateStore()

function submitForm() {
  // TODO!
}
</script>

<template>
  <div id="full-screen-wrapper" class="full-screen" v-if="overlayStateStore.createShareUrl">
    <div id="share-url-view-create">
      <div id="share-url-view-header">
        <button id="close-button" @click="overlayStateStore.setShareUrlView(false)">
          <CloseButtonSVG/>
        </button>
        <h1>Create Share URL</h1>
      </div>
      <Vueform
          ref="form$"
          add-class="solardoc-style-form"
          :display-errors="false"
          :endpoint="false"
          @submit="submitForm"
      >
        <TextElement
            name="text"
            label="Generated Link:"
            :disabled="true"
        />
        <CheckboxElement
          name="write"
          text="Write access"
          info="(Currently unavailable!) Gives the participant write access to your presentation (read is always present)"
          size="lg"
          disabled
        />

        <ButtonElement
          name="create"
          button-label="Create"
          disabled
          :columns="{
            container: 1,
          }"
          :submits="true"
        />
        <ButtonElement
          name="go-back"
          button-label="Go Back"
          :resets="true"
          :columns="{
            container: 3,
          }"
          :secondary="true"
          align="center"
        />
      </Vueform>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/var' as var;
@use '@/assets/core/mixins/align-center' as *;

#full-screen-wrapper {
  @include align-center;

  #share-url-view-create {

    position: relative;
    flex: 0 1 auto;
    height: max-content;
    border-radius: 1rem;
    padding: 0.5rem 2rem;
    background-color: var.$overlay-background-color;
    box-shadow: 0 0 10px 0 var.$box-shadow-color;

    // Adjust size depending on the screen width
    width: 90vw;

    @media screen and (min-width: var.$window-medium) {
      & {
        width: 60vw;
      }
    }

    @media screen and (min-width: var.$window-large) {
      & {
        width: 50vw;
      }
    }

    #close-button {
      position: absolute;
      z-index: 101;
      margin: 0;
      right: 3rem;
      top: calc(0.5rem + 40px * 0.67 + 40px - 1.5rem - 4px);

      svg {
        width: 1.5rem;
        height: 1.5rem;
        fill: var.$text-color;
      }
    }

    p {
      margin-bottom: 1rem;
    }
  }
}
</style>