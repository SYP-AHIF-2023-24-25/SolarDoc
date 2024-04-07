<script setup lang="ts">
import { useCurrentUserStore } from '@/stores/current-user'
import { useRouter } from 'vue-router'
import { PhoenixRestError } from '@/services/phoenix/errors'

const currentUserStore = useCurrentUserStore()
const $router = useRouter()

currentUserStore.fetchCurrentUserIfNotFetchedAndAuthValid()

// Ensure if the user is not logged in that he is redirected to the '/login' page
if (!currentUserStore.loggedIn) {
  $router.push('/login')
}

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
  <div id="profile-wrapper" class="page-form-wrapper">
    <div id="profile-container" class="page-form-container large">
      <button id="logout-button" class="highlighted-button" @click="logout()">Logout</button>
      <div id="profile-form">
        <h1>
          Profile Page ~<code>{{ currentUserStore.currentUser?.username || '' }}</code>
        </h1>
        <div id="profile-description">
          <p>
            <span>Id:</span><code>{{ currentUserStore.currentUser?.id || '' }}</code>
          </p>
          <p><span>Email:</span> {{ currentUserStore.currentUser?.email || '' }}</p>
          <p><span>Role:</span> {{ currentUserStore.currentUser?.role || '' }}</p>
          <p>
            <span>Confirmed At:</span> {{ currentUserStore.currentUser?.confirmed_at || 'NaN' }}
          </p>
          <p><span>Organisation:</span> {{ currentUserStore.currentUser?.organisation || '' }}</p>
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
  display: flex;
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
    flex: 1 1 auto;
    flex-direction: column;
    min-width: 100%;

    h1 {
      // Avoid line break
      white-space: nowrap;
      margin-right: 10rem;
    }

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
