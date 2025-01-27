<script lang="ts" setup>
import { useCurrentUserStore } from '@/stores/current-user'
import { useRouter } from 'vue-router'
import ProfileHeader from '@/components/profile/header/ProfileHeader.vue'
import ProfileFilesOverview from '@/components/profile/files/ProfileFilesOverview.vue'
import ProfileViewHeaderButtons from '@/components/profile/header/ProfileViewHeaderButtons.vue'

const currentUserStore = useCurrentUserStore()
const $router = useRouter()

currentUserStore.fetchCurrentUserIfNotFetchedAndAuthValid()

// Ensure if the user is not logged in that he is redirected to the '/login' page
if (!currentUserStore.loggedIn) {
  $router.push('/login')
}
</script>

<template>
  <div
    id="profile-wrapper"
    class="page-content-wrapper heart-background"
    v-if="currentUserStore.loggedIn"
  >
    <div id="profile-container" class="page-content-container large">
      <div id="profile-body">
        <ProfileHeader />
        <ProfileViewHeaderButtons />
      </div>
      <ProfileFilesOverview />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/page-content' as *;
@use '@/assets/heart-background' as *;
@use '@/assets/core/mixins/screen-size' as *;
@use '@/assets/core/mixins/hide' as *;
@use '@/assets/core/mixins/align-center' as *;
@use '@/assets/core/var' as var;

#profile-container {
  display: flex;
  position: relative;
  align-content: unset;
  justify-content: unset;

  #profile-body {
    display: flex;
    flex: 1 1 auto;
    flex-flow: column nowrap;
    justify-content: space-between;
    padding: 0;
    margin: 0;
    width: 100%;

    @include r-min(var.$window-medium) {
      flex-flow: row nowrap;
    }
  }
}
</style>
