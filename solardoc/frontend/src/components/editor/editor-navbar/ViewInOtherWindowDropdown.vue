<script lang="ts" setup>
import Dropdown from 'v-dropdown'
import ScreenIconSVG from '@/components/icons/ScreenIconSVG.vue'
import ScreenIconDarkModeSVG from '@/components/icons/ScreenIconDarkModeSVG.vue'
import { useDarkModeStore } from '@/stores/dark-mode'
import { useRenderDataStore } from '@/stores/render-data'
import {useInitStateStore} from "@/stores/init-state"
import {type Ref, ref} from 'vue'
import {storeToRefs} from "pinia";

const darkModeStore = useDarkModeStore()
const renderData = useRenderDataStore()
const initStateStore = useInitStateStore()

const { previewURL } = <{ previewURL: Ref<string>; }>storeToRefs(renderData)

const dropdown = ref(null)
function closeDropdown() {
  ;(dropdown.value as { close: () => void } | null)?.close()
}

function handlePresentationViewClick() {
  if (!previewURL) return
  closeDropdown()
  window.open(renderData.previewURL, '_blank')
}

function handlePrintPdfViewClick() {
  if (!previewURL) return
  closeDropdown()
  const printPdfUrl = `${renderData.previewURL}?print-pdf`
  window.open(printPdfUrl, '_blank')
}
</script>

<template>
  <Dropdown ref="dropdown">
    <template #trigger="{ visible }">
      <!-- @vue-expect-error The types from the library seem to be wrong. Property "visible" can only be used when
      "value" is also used.
      -->
      <button
        id="simple-sandwich-menu-button"
        :class="{ highlighted: visible.value }"
        class="sandwich-button"
      >
        <ScreenIconSVG v-show="!darkModeStore.darkMode" />
        <ScreenIconDarkModeSVG v-show="darkModeStore.darkMode" />
      </button>
    </template>
    <div id="dropdown-elements">
      <div
        class="dropdown-element"
        @click="handlePresentationViewClick()"
        v-tooltip="'Switch to presentation mode'"
        :disabled="initStateStore.init || !previewURL"
      >
        Presentation View
      </div>
      <div
        class="dropdown-element"
        @click="handlePrintPdfViewClick()"
        v-tooltip="'Prepare and print as PDF'"
        :disabled="initStateStore.init || !previewURL"
      >
        Print-PDF View
      </div>
    </div>
  </Dropdown>
</template>

<style lang="scss" scoped>
@use '@/assets/core/var' as var;
@use '@/assets/core/mixins/link-hover-presets' as *;

#dropdown-elements {
  width: 200px;
  background-color: var.$overlay-background-color;
  box-shadow: 0 0 10px 0 var.$box-shadow-color;

  &,
  * {
    overflow: visible;
    z-index: 100;
  }

  @media (max-width: 600px) {
    width: calc(100vw - 2rem);
    padding: 1rem;
  }

  & > .dropdown-element {
    @include link-hover-presets-with-background;
    padding: 0.6rem 0.6rem 0.6rem 1rem;
    cursor: pointer;

    &:not(:last-child) {
      border-bottom: 1px solid #e0e0e0;
    }

    &[disabled='true'] {
      cursor: not-allowed;
      color: var.$disabled-text-color;

      &:hover {
        background-color: unset;
        color: var.$disabled-text-color !important;
      }
    }
  }
}
</style>
