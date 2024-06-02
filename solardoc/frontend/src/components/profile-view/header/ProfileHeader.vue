<script lang="ts" setup>
import { useCurrentUserStore } from '@/stores/current-user'

const currentUserStore = useCurrentUserStore()
</script>

<template>
  <div id="profile-header">
    <h1 id="profile-header-text">
      Profile Page ~<code>{{ currentUserStore.currentUser?.username || '' }}</code>
    </h1>
    <div id="profile-description">
      <p>
        <span>Id:</span><code>{{ currentUserStore.currentUser?.id || '' }}</code>
      </p>
      <p><span>Email:</span> {{ currentUserStore.currentUser?.email || '' }}</p>
      <p><span>Role:</span> {{ currentUserStore.currentUser?.role || '' }}</p>
      <p><span>Confirmed At:</span> {{ currentUserStore.currentUser?.confirmed_at || 'NaN' }}</p>
      <p><span>Organisation:</span> {{ currentUserStore.currentUser?.organisation || '' }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
#profile-header {
  margin-right: 2rem;

  h1 {
    // Avoid line break
    white-space: nowrap;
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
</style>
