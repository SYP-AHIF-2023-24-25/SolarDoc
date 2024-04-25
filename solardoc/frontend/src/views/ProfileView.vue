<script setup lang="ts">
import {useCurrentUserStore} from '@/stores/current-user'
import {useRouter} from 'vue-router'
import {PhoenixInternalError, PhoenixRestError} from '@/services/phoenix/errors'
import * as phoenixRestService from "@/services/phoenix/api-service";
import type {File} from "@/services/phoenix/api-service";
import {ref} from "vue";
import {getHumanReadableTimeInfo} from "@solardoc/frontend/src/scripts/format-date";
import ProfileHeader from "@/components/profile-view/header/ProfileHeader.vue";
import ProfileFileOverview from "@/components/profile-view/ProfileFileOverview.vue";
import ProfileViewHeaderButtons from "@/components/profile-view/header/ProfileViewHeaderButtons.vue";

const currentUserStore = useCurrentUserStore()
const $router = useRouter()

currentUserStore.fetchCurrentUserIfNotFetchedAndAuthValid()

// Ensure if the user is not logged in that he is redirected to the '/login' page
if (!currentUserStore.loggedIn) {
  $router.push('/login')
}

let files = ref([] as File[])
fetchFiles(currentUserStore.bearer!)

async function fetchFiles(bearer: string) {
  let resp: Awaited<ReturnType<typeof phoenixRestService.getV1Files>>
  try {
    resp = await phoenixRestService.getV1Files(bearer)
  } catch (e) {
    throw new PhoenixInternalError(
        'Critically failed to fetch current user. Cause: ' + (<Error>e).message,
    )
  }
  if (resp.status === 200) {
    files.value = resp.data;
  } else if (resp.status === 401) {
    throw new PhoenixRestError(
        'Server rejected request to fetch current user. Cause: Unauthorized',
        resp.status,
    )
  }
}

async function deleteFileById(id : string) {
  let resp: Awaited<ReturnType<typeof phoenixRestService.deleteV1FilesById>>
  try {
    resp = await phoenixRestService.deleteV1FilesById(currentUserStore.bearer!,id)
  } catch (e) {
    throw new PhoenixInternalError(
        'Critically failed to delete file. Cause: ' + (<Error>e).message,
    )
  }
}
</script>

<template>
  <div id="profile-wrapper" class="page-form-wrapper">
    <div id="profile-container" class="page-form-container large">
      <div id="profile-body">
        <ProfileHeader />
        <ProfileViewHeaderButtons />
      </div>
      <ProfileFileOverview />
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

  #profile-body {
    display: flex;
    flex: 1 1 auto;
    flex-flow: row nowrap;
    justify-content: space-between;
    width: 100%;
  }
}
</style>
