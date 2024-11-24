<script setup lang="ts">
import { useOverlayStateStore } from '@/stores/overlay-state'
import CloseButtonSVG from '@/components/icons/CloseButtonSVG.vue'
import { useCurrentFileStore } from '@/stores/current-file'
import { getHumanReadableTimeInfo } from '@/scripts/format-date'
import { ref } from 'vue'
import { useCurrentUserStore } from '@/stores/current-user'
import CollaboratorList from '@/components/editor/dropdown/editor-settings/CollaboratorList.vue'
import {interceptErrors} from "@/errors/handler/error-handler";
import {ensureLoggedIn} from "@/scripts/ensure-logged-in";
import {showInfoNotifFromObj} from "@/scripts/show-notif";
import constants from "@/plugins/constants";
import {useRouter} from "vue-router";

const overlayStateStore = useOverlayStateStore()
const currentFileStore = useCurrentFileStore()
const currentUserStore = useCurrentUserStore()
const $router = useRouter()

// Last modified is a ref which is updated every 0.5 second to show the last modified time
let lastModified = ref(getLastModified())
let created = ref(getCreated())

function getLastModified(): string {
  return getHumanReadableTimeInfo(currentFileStore.lastModified)
}

function getCreated(): string {
  return getHumanReadableTimeInfo(currentFileStore.created)
}

const updateTimeRefs = () => {
  lastModified.value = getLastModified()
  created.value = getCreated()
}
setInterval(updateTimeRefs, 500)

async function saveChanges() {
  await interceptErrors(
      ensureLoggedIn($router).then(
          async () => await currentFileStore.storeOnServer(currentUserStore.bearer!),
      ),
  )
  showInfoNotifFromObj(constants.notifMessages.fileSaved)
}
</script>

<template>
  <div
    v-if="overlayStateStore.settings"
    id="full-screen-wrapper"
    class="page-content-wrapper blurred-background-full-screen-overlay"
  >
    <div id="file-settings" class="page-content-container large full-screen-overlay-content">
      <div id="settings-view-header">
        <h1>File Settings</h1>
        <button id="close-button" @click="overlayStateStore.setSettings(false)">
          <CloseButtonSVG />
        </button>
      </div>
      <div id="settings-file-info">
        <div id="settings-file-info-title">
          <div v-if="currentFileStore.ownerId === currentUserStore.currentUser?.id">
            <input
                type="text"
                v-model="currentFileStore.fileName"
                id="editable-file-name"
            />
            <button
                id="save-button"
                class="highlighted-button"
                @click="saveChanges">
              ✓
            </button>
          </div>
          <div v-else>
            <h2>{{ currentFileStore.fileName }}</h2>
          </div>
        </div>
        <p id="settings-file-info-file-id">
          <i class="pi pi-wrench"></i>
          ID: {{ currentFileStore.fileId || 'Not registered' }}
        </p>
        <div id="settings-file-info-details">
          <p><span>Owner:</span> {{ currentFileStore.ownerId }}</p>
          <p><span>Created:</span> {{ created }}</p>
          <p><span>Last Modified:</span> {{ lastModified }}</p>
        </div>
        <div
          v-if="currentFileStore.ownerId === currentUserStore.currentUser?.id"
          id="collaborators-list"
        >
          <p><span>Collaborators:</span></p>
          <CollaboratorList />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/var' as var;
@use '@/assets/core/mixins/align-center' as *;
@use '@/assets/core/mixins/align-horizontal-center' as *;
@use '@/assets/core/mixins/icon-presets' as *;
@use '@/assets/full-screen-overlay' as *;

#full-screen-wrapper {
  @include align-center;

  #file-settings {
    position: relative;
    flex: 0 1 auto;
    height: max-content;
    border-radius: 1rem;
    padding: 0.5rem 2rem;
    background-color: var.$overlay-background-color;
    box-shadow: 0 0 10px 0 var.$box-shadow-color;

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

    #settings-file-info {
      display: flex;
      flex: 0 0 auto;
      flex-grow: 1;
      flex-direction: column;
      margin-bottom: 1rem;

      #settings-file-info-title {
        @include align-horizontal-center;
        margin-bottom: 0;

        span {
          padding-top: 1px;
        }
      }

      #editable-file-name {
        background-color: var.$overlay-background-color;
        color: var.$text-color;
        border: 1px solid var.$scheme-friendly-blue;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
        font-size: 1.5em;
      }

      #save-button{
        margin-left: 2rem;
      }
      #settings-file-info-file-id {
        margin: 0.1rem 0 0 0;
        padding: 0 0 0 0.6rem;
        font-size: 0.9rem;
        line-height: 1.5rem;

        i {
          @include icon-presets;
        }
      }

      #settings-file-info-details {
        margin-left: 0.5rem;
        line-height: 2rem;

        &,
        & * {
          background: transparent;
        }
      }
      #collaborators-list {
        display: flex;
        margin-left: 0.5rem;
        line-height: 2rem;
        flex-grow: 1;
        flex-direction: column;

        margin-bottom: 1rem;
      }

      code {
        padding: 0 0.25rem;
      }

      span {
        font-weight: bold;
      }
    }
  }
}
</style>
