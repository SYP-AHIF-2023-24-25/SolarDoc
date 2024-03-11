<script setup lang="ts">
import {useCurrentUserStore} from "@/stores/current-user";
import {useRouter} from "vue-router";

const currentUserStore = useCurrentUserStore()
const $router = useRouter()

currentUserStore.fetchCurrentUserIfNotFetchedAndAuthValid()

// Ensure if the user is not logged in that he is redirected to the '/login' page
if (!currentUserStore.loggedIn) {
  $router.push("/login")
}

async function logout() {
  await currentUserStore.logout()
  await $router.push("/login")
}
</script>

<template>
  <div id="profile-wrapper" class="page-form-wrapper">
    <div id="profile-container" class="page-form-container">
      <button id="logout-button" class="highlighted-button" @click="logout()">
        Logout
      </button>
      <div id="profile-form">
        <h1>Profile Page</h1>
        <div id="profile-description">
          <p><span>Id:</span><code>{{ currentUserStore.currentUser?.id || '' }}</code></p>
          <p><span>Email:</span> {{ currentUserStore.currentUser?.email || '' }}</p>
          <p><span>Role:</span> {{ currentUserStore.currentUser?.role || '' }}</p>
          <p><span>Confirmed At:</span> {{ currentUserStore.currentUser?.confirmed_at || 'NaN' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/var' as var;
@use '@/assets/page-form' as *;
@use '@/assets/core/mixins/align-center' as *;

#profile-container {
  position: relative;
  align-content: unset;
  justify-content: unset;

  #logout-button {
    position: absolute;
    top: calc(0.5rem + 40px * 0.67 + 48px - 1.5rem - 4px);
    right: 1.5rem;
    z-index: 101;

    svg {
      width: 1.5rem;
      height: 1.5rem;
      fill: var.$text-color;
    }
  }

  #profile-form {
    flex: 0 1 auto;
    flex-direction: column;
    width: 100%;

    p {
      margin-bottom: 1rem;
    }

    small {
      font-style: italic;
    }

    code {
      padding: 0 0.25rem;
    }

    span {
      font-weight: bold;
    }
  }
}
</style>
