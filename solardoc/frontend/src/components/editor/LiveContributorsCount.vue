<script setup lang="ts">
import { ref} from "vue";
import PersonCount from "@/components/icons/PersonCountIconSVG.vue";
import PersonCountDarkMode from "@/components/icons/PersonCountIconDarkModeSVG.vue";
import { useDarkModeStore } from "@/stores/dark-mode";
import {useCurrentFileStore} from "@/stores/current-file";
import {useCurrentUserStore} from "@/stores/current-user";
import type {FilePermission, FilePermissions} from "@/services/phoenix/gen/phoenix-rest-service";
import type {Awaited} from "@vueuse/core";
import * as phoenixRestService from "@/services/phoenix/api-service";
import {type ActualPhxErrorResp, PhoenixBadRequestError, PhoenixInternalError} from "@/services/phoenix/errors";

const darkModeStore = useDarkModeStore();
const currentFileStore = useCurrentFileStore()
const currentUserStore = useCurrentUserStore()
const contributors = ref<Array<FilePermission>>([])

;(async () => {
  await fetchFilePermissions(currentUserStore.bearer!)
})()

async function fetchFilePermissions(bearerToken: string) {
  let resp: Awaited<ReturnType<typeof phoenixRestService.getV2FilesByFileIdPermissions>>
  try {
    resp = await phoenixRestService.getV2FilesByFileIdPermissions(
        bearerToken,
        currentFileStore.fileId!,
    )
  } catch (e) {
    throw new PhoenixInternalError(
        'Critically failed to fetch file permissions for file. Cause: ' + (<Error>e).message,
    )
  }
  if (resp.status === 200) {
    contributors.value = resp.data satisfies FilePermissions
  } else if (resp.status === 400) {
    throw new PhoenixBadRequestError(
        'Server rejected request to get file permissions',
        resp.data as ActualPhxErrorResp,
    )
  }
}

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
        <span class="contributor-count">{{ contributors.length }}</span>
      </button>
    </div>

    <div
        v-if="dropdown"
        class="dropdown-menu"
        @mouseenter="toggleDropdown(true)"
        @mouseleave="toggleDropdown(false)"
    >
      <div v-for="contributor in contributors" :key="contributor.name" class="dropdown-element">
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