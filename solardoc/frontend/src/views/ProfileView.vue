<script setup lang="ts">
import {useCurrentUserStore} from "@/stores/current-user";
import {useRouter} from "vue-router";

const currentUserStore = useCurrentUserStore()
const $router = useRouter()

// Ensure if the user is not logged in that he is redirected to the '/login' page
if (!currentUserStore.currentUser || !currentUserStore.currentAuth) {
  $router.push("/login")
}
</script>

<template>
  <div id="profile-wrapper" class="page-form-wrapper">
    <div id="profile-container" class="page-form-container">
      <div id="profile-form">
        <h1>Profile Page</h1>
        <div id="profile-description">
          <p><span>Id:</span><code>{{ currentUserStore.currentUser?.id || '' }}</code></p>
          <p><span>Email:</span> {{ currentUserStore.currentUser?.email || '' }}</p>
          <p><span>Role:</span> {{ currentUserStore.currentUser?.role || '' }}</p>
          <p><span>Confirmed At:</span> {{ currentUserStore.currentUser?.confirmed_at || 'NaN' }}</p>
        </div>
        <small>This means you are successfully logged in.</small>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/page-form' as *;
@use '@/assets/core/mixins/align-center' as *;

#profile-container {
  align-content: unset;
  justify-content: unset;

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
