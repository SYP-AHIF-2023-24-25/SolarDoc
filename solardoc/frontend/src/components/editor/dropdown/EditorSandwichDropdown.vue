<script setup lang="ts">
import Dropdown from 'v-dropdown'
import SandwichMenuSVG from '@/components/icons/SandwichMenuSVG.vue'
import SandwichMenuDarkModeSVG from '@/components/icons/SandwichMenuDarkModeSVG.vue'
import { useDarkModeStore } from '@/stores/dark-mode'
import { useOverlayStateStore } from '@/stores/overlay-state'
import { useCurrentFileStore } from '@/stores/current-file'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { useCurrentUserStore } from '@/stores/current-user'
import {showInfoNotifFromObj} from "@/scripts/show-notif";
import {ensureLoggedIn} from "@/scripts/ensure-logged-in";
import {interceptErrors} from "@/errors/error-handler";
import constants from "@/plugins/constants";

const darkModeStore = useDarkModeStore()
const currentUserStore = useCurrentUserStore()
const overlayStateStore = useOverlayStateStore()
const currentFileStore = useCurrentFileStore()

const dropdown = ref(null)
const $router = useRouter()

function closeDropdown() {
  ;(
    dropdown.value as {
      close: () => void
    } | null
  )?.close()
}

function handleJoinChannel() {
  overlayStateStore.setChannelView(true)
  closeDropdown()
}

async function handleSaveButtonClick() {
  await interceptErrors(ensureLoggedIn($router))
  await currentFileStore.storeOnServer(currentUserStore.bearer!)
  showInfoNotifFromObj(constants.notifMessages.fileSaved)
  closeDropdown()
}

function handleNewFileButtonClick() {
  currentFileStore.closeFile()
  closeDropdown()
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
      <div class="dropdown-element" @click="handleJoinChannel()">Channels</div>
      <div class="dropdown-element" @click="handleSaveButtonClick()">Save in profile</div>
      <div class="dropdown-element" @click="handleNewFileButtonClick()">New File</div>
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
