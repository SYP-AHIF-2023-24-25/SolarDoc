<script setup lang="ts">
import type { File } from '@/services/phoenix/api-service'
import * as phoenixRestService from '@/services/phoenix/api-service'
import { useCurrentUserStore } from '@/stores/current-user'
import { PhoenixInternalError, PhoenixRestError } from '@/services/phoenix/errors'
import FileCard from '@/components/profile-view/file-view/FileCard.vue'
import { ref } from 'vue'

const currentUserStore = useCurrentUserStore()

const files = ref<Array<File>>([])
fetchFiles(currentUserStore.bearer!)

async function fetchFiles(bearer: string) {
  let resp: Awaited<ReturnType<typeof phoenixRestService.getV1Files>>
  try {
    resp = await phoenixRestService.getV1Files(bearer)
  } catch (e) {
    throw new PhoenixInternalError(
      'Critically failed to fetch current user files. Cause: ' + (<Error>e).message,
    )
  }
  if (resp.status === 200) {
    files.value = resp.data satisfies Array<File>
    files.value.sort((a, b) => {
      return new Date(b.last_edited!).getTime() - new Date(a.last_edited!).getTime()
    })
  } else if (resp.status === 401) {
    throw new PhoenixRestError(
      'Server rejected request to fetch current user files. Cause: Unauthorized',
      resp.status,
    )
  }
}
</script>

<template>
  <div id="profile-file-overview-files">
    <FileCard v-for="file in files" :file="file" :key="file.id" />
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/var' as var;

#profile-file-overview-files {
  display: flex;
  flex: 0 1;
  flex-flow: column wrap;
  justify-content: space-around;
  flex-direction: row;
  row-gap: 2rem;
}
</style>
