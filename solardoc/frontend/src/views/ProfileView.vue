<script lang="ts" setup>
import {useCurrentUserStore} from '@/stores/current-user'
import {useRouter} from 'vue-router'
import ProfileHeader from '@/components/profile-view/header/ProfileHeader.vue'
import ProfileFileOverview from '@/components/profile-view/file-view/ProfileFileOverview.vue'
import ProfileViewHeaderButtons from '@/components/profile-view/header/ProfileViewHeaderButtons.vue'

const currentUserStore = useCurrentUserStore()
const $router = useRouter()

currentUserStore.fetchCurrentUserIfNotFetchedAndAuthValid()

// Ensure if the user is not logged in that he is redirected to the '/login' page
if (!currentUserStore.loggedIn) {
  $router.push('/login')
}
</script>

<template>
  <div id="profile-wrapper" class="page-content-wrapper">
    <div id="profile-container" class="page-content-container large">
      <div id="profile-body">
        <ProfileHeader />
        <ProfileViewHeaderButtons />
      </div>
      <ProfileFileOverview />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/core/var' as var;
@use '@/assets/page-content' as *;
@use '@/assets/core/mixins/align-center' as *;

#profile-container {
  display: flex;
  position: relative;
  align-content: unset;
  justify-content: unset;

  #profile-body {
    display: flex;
    flex: 1 1 auto;
    flex-flow: row nowrap;
    justify-content: space-between;
    width: 100%;
  }
}
</style>
