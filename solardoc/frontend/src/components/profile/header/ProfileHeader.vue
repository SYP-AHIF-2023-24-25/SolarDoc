<script lang="ts" setup>
import { useCurrentUserStore } from '@/stores/current-user'
import UserRef from '@/components/common/UserRef.vue'

const currentUserStore = useCurrentUserStore()
</script>

<template>
  <div class="profile-header desktop">
    <h1 class="profile-header-text">
      <UserRef
        :id="currentUserStore.currentUser!!.id!!"
        :user-name="currentUserStore.currentUser!!.username!!"
        no-padding
        :top="-20"
      />
    </h1>
    <div class="profile-description">
      <p><span>Email:</span> {{ currentUserStore.currentUser?.email || '' }}</p>
      <p><span>Role:</span> {{ currentUserStore.currentUser?.role || '' }}</p>
      <p>
        <span>Confirmed At:</span> {{ currentUserStore.currentUser?.confirmed_at || 'Unknown' }}
      </p>
      <p><span>Organisation:</span> {{ currentUserStore.currentUser?.organisation || '' }}</p>
    </div>
  </div>
  <div class="profile-header phone">
    <h1 class="profile-header-text">
      <code>{{ currentUserStore.currentUser?.username || '' }}</code>
    </h1>
    <div class="profile-description">
      <p><span>Email:</span> {{ currentUserStore.currentUser?.email || '' }}</p>
      <p><span>Role:</span> {{ currentUserStore.currentUser?.role || '' }}</p>
      <p>
        <span>Confirmed At:</span> {{ currentUserStore.currentUser?.confirmed_at || 'Unknown' }}
      </p>
      <p><span>Organisation:</span> {{ currentUserStore.currentUser?.organisation || 'None' }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/core/mixins/screen-size' as *;
@use '@/assets/core/mixins/hide' as *;
@use '@/assets/core/mixins/hide-scrollbar' as *;
@use '@/assets/core/var' as var;

.profile-header {
  margin-right: 2rem;

  .profile-header-text {
    @include hide-scrollbar;
    width: 100%;
    overflow-x: scroll;
    white-space: nowrap;
    -ms-overflow-style: none;
    scrollbar-width: none;

    & span span {
      position: relative;
      top: -20px;
    }
  }

  p {
    margin-bottom: 1rem;
  }

  small {
    font-style: italic;
  }

  code {
    padding: 0;
    margin: 0;
  }

  span {
    font-weight: bold;
  }
}

.profile-header.phone {
  @include show;
  width: 100%;

  .profile-header-text {
    line-height: 1;
    margin: 0.33em 0;

    width: 100%;
    overflow-x: scroll;
    white-space: nowrap;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
}

.profile-header.desktop {
  @include hide;
}

@include r-min(var.$window-medium) {
  .profile-header.desktop {
    @include show;
  }

  .profile-header.phone {
    @include hide;
  }
}
</style>
