<script setup lang="ts">
import { ref} from "vue";
import PersonCount from "@/components/icons/PersonCountIconSVG.vue";
import PersonCountDarkMode from "@/components/icons/PersonCountIconDarkModeSVG.vue";
import { useDarkModeStore } from "@/stores/dark-mode";
import {useCurrentFileStore} from "@/stores/current-file";
import {useCurrentUserStore} from "@/stores/current-user";
import {useContributorsStore} from "@/stores/contributors";

const darkModeStore = useDarkModeStore();
const currentFileStore = useCurrentFileStore()
const currentUserStore = useCurrentUserStore()
const contributorsStore = useContributorsStore();

(async () => {
  await contributorsStore.fetchAndUpdateContributors(
      currentUserStore.bearer!,
      currentFileStore.fileId!
  );
})();

const dropdown = ref(false);

const toggleDropdown = (visible: boolean) => {
  dropdown.value = visible;
};
</script>

<template>
  <div class="live-contributors">
    <div
        class="icon-and-count"
        @mouseenter="toggleDropdown(true)"
        @mouseleave="toggleDropdown(false)"
    >
      <button class="contributor-button">
        <PersonCount v-show="!darkModeStore.darkMode" />
        <PersonCountDarkMode v-show="darkModeStore.darkMode" />
        <span class="contributor-count"> {{ contributorsStore.contributors.length }}</span>
      </button>
    </div>

    <div
        v-if="dropdown"
        class="dropdown-menu"
        @mouseenter="toggleDropdown(true)"
        @mouseleave="toggleDropdown(false)"
    >
      <div
          v-for="contributor in contributorsStore.contributors"
          :key="contributor.user_id"
          class="dropdown-element"
      >
        {{ contributor.username }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/core/var' as var;
@use '@/assets/core/mixins/link-hover-presets' as *;

.live-contributors {
  position: relative;
  display: inline-block;

  .icon-and-count {
    display: flex;
    align-items: center;
    gap: 8px;

    .contributor-button {
      display: flex;
      align-items: center;
      background: none;
      border: none;
      cursor: pointer;

      svg {
        display: block;
        height: 1em;
      }

      .contributor-count {
        font-size: 1rem;
        margin-left: 0.5rem;
        color: var(--text-color);
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
    width: 200px;
    z-index: 100;

    @media (max-width: 600px) {
      width: calc(100vw - 2rem);
      padding: 1rem;
    }

    .dropdown-element {
      padding: 0.6rem 1rem;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: var(--hover-background-color);
      }

      &:not(:last-child) {
        border-bottom: 1px solid #e0e0e0;
      }
    }
  }
}
</style>