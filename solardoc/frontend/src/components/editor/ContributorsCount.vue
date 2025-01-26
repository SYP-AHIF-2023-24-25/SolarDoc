<script setup lang="ts">
import {ref, watch} from 'vue'
import PersonCount from '@/components/icons/PersonCountIconSVG.vue'
import PersonCountDarkMode from '@/components/icons/PersonCountIconDarkModeSVG.vue'
import { useDarkModeStore } from '@/stores/dark-mode'
import { useCurrentFileStore } from '@/stores/current-file'
import { useCurrentUserStore } from '@/stores/current-user'
import { useContributorsStore } from '@/stores/contributors'
import {waitForConditionAndExecute} from "@/scripts/wait-for";
import {interceptErrors} from "@/errors/handler/error-handler";
import {useFileOwnerStore} from "@/stores/file-owner";
import {storeToRefs} from "pinia";

const darkModeStore = useDarkModeStore()
const currentFileStore = useCurrentFileStore()
const currentUserStore = useCurrentUserStore()
const contributorsStore = useContributorsStore()
const fileOwnerStore = useFileOwnerStore()

const { contributors } = storeToRefs(contributorsStore)
const { owner } = storeToRefs(fileOwnerStore)

interceptErrors((async () => {
  if (currentUserStore.loggedIn && !!currentUserStore.bearer) {
    await waitForConditionAndExecute(
      () => currentFileStore.remoteFile && !!currentFileStore.ownerId,
      async () => await contributorsStore.fetchAndUpdateContributors(
        currentUserStore.bearer!,
        currentFileStore.fileId!,
      ),
      500,
    )
  }
})())

const dropdown = ref(false)
const toggleDropdown = (visible: boolean) => {
  dropdown.value = visible
}

// Watch contributors and owner to update the dropdown
const combinedContributors = ref<Array<{ user_id: string, username?: string }>>([])
const updateContent = () => {
  combinedContributors.value = [...contributors.value]
  if (owner.value) {
    combinedContributors.value.unshift({ user_id: owner.value.id, username: owner.value.username })
  }
}

updateContent()
watch([contributors, owner], updateContent)
</script>

<template>
  <div class="contributors">
    <!-- TODO: Mouse events need to be replaced with actual SCSS! -->
    <div
      class="icon-and-count"
      @mouseenter="toggleDropdown(true)"
      @mouseleave="toggleDropdown(false)"
    >
      <div class="contributor-button">
        <PersonCount v-show="!darkModeStore.darkMode" />
        <PersonCountDarkMode v-show="darkModeStore.darkMode" />
        <span class="contributor-count"> {{ combinedContributors.length }}</span>
      </div>
    </div>
    <!-- TODO: Mouse events need to be replaced with actual SCSS! -->
    <div
      v-show="dropdown"
      class="dropdown-menu"
      @mouseenter="toggleDropdown(true)"
      @mouseleave="toggleDropdown(false)"
    >
      <div
        v-for="contributor in combinedContributors"
        :key="contributor.user_id"
        class="dropdown-element"
      >
        {{ contributor.username }}
        <span id="owner-tag" v-if="owner !== undefined && contributor.user_id === owner.id">Owner</span>
        <span id="you-tag" v-else-if="contributor.user_id === currentUserStore.currentUser?.id">You</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/core/var' as var;
@use '@/assets/core/mixins/link-hover-presets' as *;

.contributors {
  position: relative;
  display: inline-block;
  height: 2rem;
  padding: var.$editor-menu-padding;
  margin: var.$editor-menu-margin;

  .icon-and-count {
    display: flex;
    align-items: center;

    .contributor-button {
      display: flex;
      align-items: center;
      background: none;
      border: none;
      cursor: pointer;
      margin: 0;
      text-decoration: none;

      &:hover {
        background-color: var(--hover-background-color);
      }

      svg {
        display: block;
        height: 1rem;
        transition: fill 0.2s ease;
      }

      .contributor-count {
        font-size: 1rem;
        color: var(--text-color);
        transition: color 0.2s ease;
        margin: 0.3rem 0 0 0.2rem;
      }
    }

    .contributor-button:hover {
      svg {
        fill: var(--hover-icon-color);
      }

      .contributor-count {
        color: var(--hover-text-color);
      }
    }
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    background-color: var.$overlay-background-color;
    box-shadow: 0 0 10px 0 var.$box-shadow-color;
    border-radius: 4px;
    width: 250px;
    z-index: 100;

    // Align the dropdown at the center of the icon
    transform: translateX(-40%);

    .dropdown-element {
      padding: 0.6rem 1rem;
      cursor: pointer;
      transition: background-color 0.2s;
      font-size: 0.95rem;

      // If the name is too big to fit in the dropdown,
      white-space: nowrap;
      overflow: hidden;

      &:hover {
        background-color: var(--hover-background-color);
      }

      &:not(:last-child) {
        border-bottom: 1px solid #e0e0e0;
      }

      #owner-tag,
      #you-tag {
        margin: 0 0 0 0.3rem;
        transform: translateY(-0.1rem);
        color: white;
        height: 1.2rem;
        width: 1.2rem;
        padding: 4px 4px 2px 4px;
        border-radius: 2px;
      }

      #owner-tag {
        background-color: var.$scheme-friendly-blue;
      }

      #you-tag {
        background-color: var.$scheme-healthy-green-soft;
      }
    }
  }
}
</style>
