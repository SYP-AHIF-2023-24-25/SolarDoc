<script setup lang="ts">
import Dropdown from 'v-dropdown'
import SandwichMenuSVG from '@/components/icons/SandwichMenuSVG.vue'
import SandwichMenuDarkModeSVG from '@/components/icons/SandwichMenuDarkModeSVG.vue'
import { useDarkModeStore } from '@/stores/dark-mode'
import { useOverlayStateStore } from '@/stores/overlay-state'
import { ref } from 'vue'

const darkModeStore = useDarkModeStore()
const overlayStateStore = useOverlayStateStore()

const dropdown = ref(null)

function handleJoinChannel() {
  overlayStateStore.setChannelView(true)
  ;(
    dropdown.value as {
      close: () => void
    } | null
  )?.close()
}
</script>

<template>
  <Dropdown ref="dropdown">
    <template #trigger="{ visible }">
      <!-- @vue-expect-error The types from the library seem to be wrong. Property "visible" can only be used when
      "value" is also used.
      -->
      <button
        id="sandwich-menu-button"
        class="sandwich-button"
        :class="{ highlighted: visible.value }"
      >
        <SandwichMenuDarkModeSVG v-show="darkModeStore.darkMode" />
        <SandwichMenuSVG v-show="!darkModeStore.darkMode" />
      </button>
    </template>
    <div id="dropdown-elements">
      <div class="dropdown-element">Close file (In work...)</div>
      <div class="dropdown-element">Save (In work...)</div>
      <div class="dropdown-element" @click="handleJoinChannel()">Channels</div>
      <div class="dropdown-element">Settings (In work...)</div>
    </div>
  </Dropdown>
</template>

<style scoped lang="scss">
@use '@/assets/core/var' as var;
@use '@/assets/core/mixins/link-hover-presets' as *;

#dropdown-elements {
  width: 200px;
  background-color: var.$overlay-background-color;
  box-shadow: 0 0 10px 0 var.$box-shadow-color;

  @media (max-width: 600px) {
    width: calc(100vw - 2rem);
    padding: 1rem;
  }

  .dropdown-element {
    @include link-hover-presets-with-background;
    padding: 0.6rem 0.6rem 0.6rem 1rem;
    cursor: pointer;

    // We add a border except for the last element
    &:not(:last-child) {
      border-bottom: 1px solid #e0e0e0;
    }
  }
}
</style>
