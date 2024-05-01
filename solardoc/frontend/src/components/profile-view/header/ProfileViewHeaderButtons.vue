<script setup lang="ts">
import { PhoenixRestError } from '@/services/phoenix/errors'
import { useCurrentUserStore } from '@/stores/current-user'
import { useRouter } from 'vue-router'

const currentUserStore = useCurrentUserStore()
const $router = useRouter()

async function logout() {
  try {
    await currentUserStore.logout()
  } catch (e) {
    if (e instanceof PhoenixRestError && e.errorCode === 401) {
      console.warn(
        '[Profile] User is not logged in (Token gone or expired, user deleted or other reason), redirecting to login page.',
      )
    } else {
      throw e
    }
  }
  await $router.push('/login')
}
</script>

<template>
  <div id="profile-view-header-buttons">
    <button id="edit-button" class="highlighted-button" disabled>Edit</button>
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
