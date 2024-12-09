<script lang="ts" setup>
import { useCurrentUserStore } from '@/stores/current-user'
import { useCurrentFileStore } from '@/stores/current-file'
import { showInfoNotifFromObj } from '@/scripts/show-notif'
import { handleError } from '@/errors/handler/error-handler'
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
    if (currentFileStore.remoteFile) {
      await currentFileStore.closeFileGlobally()
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
    <button id="edit-button" v-tooltip="'Not implemented yet'" class="highlighted-button" disabled>
      Edit
    </button>
    <button id="logout-button" class="highlighted-button" @click="logout()">Logout</button>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/core/mixins/screen-size' as *;
@use '@/assets/core/mixins/hide' as *;
@use '@/assets/core/var' as var;

#profile-view-header-buttons {
  display: flex;
  margin: 0;
  gap: 1rem;

  .highlighted-button {
    height: 2rem;
  }

  @include r-min(var.$window-medium) {
    margin-top: 2rem;
  }
}
</style>
