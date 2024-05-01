<script setup lang="ts">
import { useCurrentUserStore } from '@/stores/current-user'
import { useCurrentFileStore } from '@/stores/current-file'
import { showInfoNotifFromObj } from '@/scripts/show-notif'
import { handleError } from '@/errors/error-handler'
import constants from '@/plugins/constants'
import { useRouter } from 'vue-router'

const currentUserStore = useCurrentUserStore()
const currentFileStore = useCurrentFileStore()
const $router = useRouter()

async function logout() {
  try {
    await currentUserStore.logout()
    await $router.push('/login')

    // If there is a currently remotely opened file, close it and reset the store
    if (currentFileStore.remoteFileOpened) {
      currentFileStore.closeFile()
      showInfoNotifFromObj(constants.notifMessages.loggedOutAndFileCleared)
    } else {
      showInfoNotifFromObj(constants.notifMessages.loggedOut)
    }
  } catch (e) {
    await $router.push('/login')
    handleError(e)
  }
}
</script>

<template>
  <div id="profile-view-header-buttons">
    <button id="edit-button" class="highlighted-button" disabled v-tooltip="'Not implemented yet'">
      Edit
    </button>
    <button id="logout-button" class="highlighted-button" @click="logout()">Logout</button>
  </div>
</template>

<style scoped lang="scss">
#profile-view-header-buttons {
  display: flex;
  margin-top: 2rem;
  gap: 1rem;

  .highlighted-button {
    height: 2rem;
  }
}
</style>
