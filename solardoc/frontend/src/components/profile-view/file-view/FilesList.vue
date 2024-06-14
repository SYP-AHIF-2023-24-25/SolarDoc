<script lang="ts" setup>
import type { File } from '@/services/phoenix/api-service'
import * as phoenixRestService from '@/services/phoenix/api-service'
import { useCurrentUserStore } from '@/stores/current-user'
import { PhoenixInternalError, PhoenixInvalidCredentialsError } from '@/services/phoenix/errors'
import FileCard from '@/components/profile-view/file-view/FileCard.vue'
import { handleError } from '@/errors/handler/error-handler'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

defineProps<{ searchQuery: string }>()

const currentUserStore = useCurrentUserStore()
const $router = useRouter()

const files = ref<Array<File>>([])
;(async () => {
  try {
    await fetchFiles(currentUserStore.bearer!)
  } catch (e) {
    if (e instanceof PhoenixInvalidCredentialsError) {
      // The user is not logged in, redirect to login page
      await $router.push('/login')
      handleError(e)
    }
    throw e
  }
})()

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
    files.value = resp.data satisfies Array<File>
    files.value.sort((a, b) => {
      return new Date(b.last_edited).getTime() - new Date(a.last_edited).getTime()
    })
  } else if (resp.status === 401) {
    currentUserStore.clean()
    await $router.push('/login')
    throw new PhoenixInvalidCredentialsError(
      'Server rejected request to load profile',
      'Your saved token is invalid or has already been revoked. Please log in again.',
    )
  }
}

function filterFiles(file: File, searchQuery: string): boolean {
  return file.file_name.toLowerCase().includes(searchQuery.toLowerCase())
}
</script>

<template>
  <div id="profile-file-overview-files">
    <FileCard
      v-for="file in files.filter(file => filterFiles(file, searchQuery))"
      :key="file.id"
      :file="file"
    />
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/core/var' as var;

#profile-file-overview-files {
  display: flex;
  flex: 0 1;
  flex-flow: column wrap;
  justify-content: space-around;
  flex-direction: row;
  row-gap: 2rem;
  width: 100%;
  max-width: unset;
}
</style>
