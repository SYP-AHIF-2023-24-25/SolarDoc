<script lang="ts" setup>
import Dropdown from 'v-dropdown'
import { useDarkModeStore } from '@/stores/dark-mode'
import { ref } from 'vue'
import ScreenIconSVG from "@/components/icons/ScreenIconSVG.vue";
import ScreenIconDarkModeSVG from "@/components/icons/ScreenIconDarkModeSVG.vue";
import {useRenderDataStore} from "@/stores/render-data";

const darkModeStore = useDarkModeStore()
const dropdown = ref(null)
const renderData = useRenderDataStore();

function closeDropdown() {
  (dropdown.value as { close: () => void } | null)?.close()
}

function handlePresentationViewClick() {
  closeDropdown()
  window.open(renderData.previewURL, '_blank');
}

function handlePrintPdfViewClick() {
  closeDropdown()
  const printPdfUrl = `${this.renderData.previewURL}?print-pdf`;
  window.open(printPdfUrl, '_blank');
}
</script>

<template>
  <Dropdown ref="dropdown">
    <template #trigger="{ visible }">
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
      >Presentation View</div>
      <div
          class="dropdown-element"
          @click="handlePrintPdfViewClick()"
          v-tooltip="'Prepare and print as PDF'"
      >Print-PDF View</div>
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

  &, * {
    overflow: visible;
    z-index: 100;
  }

  @media (max-width: 600px) {
    width: calc(100vw - 2rem);
    padding: 1rem;
  }

  .dropdown-element {
    @include link-hover-presets-with-background;
    padding: 0.6rem 0.6rem 0.6rem 1rem;
    cursor: pointer;

    &:not(:last-child) {
      border-bottom: 1px solid #e0e0e0;
    }
  }
}
</style>
