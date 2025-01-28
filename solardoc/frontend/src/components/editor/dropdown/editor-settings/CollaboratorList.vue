<script setup lang="ts">
import { useCurrentFileStore } from '@/stores/current-file'
import { ref } from 'vue'
import type { FilePermission, FilePermissions } from '@/services/phoenix/api-service'
import * as phoenixRestService from '@/services/phoenix/api-service'
import { useCurrentUserStore } from '@/stores/current-user'
import type { Awaited } from '@vueuse/core'
import {
  type ActualPhxErrorResp,
  PhoenixBadRequestError,
  PhoenixInternalError,
} from '@/services/phoenix/errors'
import CollaboratorCard from '@/components/editor/dropdown/editor-settings/CollaboratorCard.vue'

const currentFileStore = useCurrentFileStore()
const currentUserStore = useCurrentUserStore()
const permissionUsers = ref<Array<FilePermission>>([])

;(async () => {
  await fetchFilePermissions(currentUserStore.bearer!)
})()

async function fetchFilePermissions(bearerToken: string) {
  let resp: Awaited<ReturnType<typeof phoenixRestService.getV2FilesByFileIdPermissions>>
  try {
    resp = await phoenixRestService.getV2FilesByFileIdPermissions(
      bearerToken,
      currentFileStore.fileId!,
    )
  } catch (e) {
    throw new PhoenixInternalError(
      'Critically failed to fetch file permissions for file. Cause: ' + (<Error>e).message,
    )
  }
  if (resp.status === 200) {
    permissionUsers.value = resp.data satisfies FilePermissions
  } else if (resp.status === 400) {
    throw new PhoenixBadRequestError(
      'Server rejected request to get file permissions',
      resp.data as ActualPhxErrorResp,
    )
  }
}
</script>

<template>
  <div v-if="permissionUsers.length > 0" id="user-permission-box">
    <CollaboratorCard
      v-for="permission in permissionUsers"
      :key="permission.id"
      :filePermission="permission"
    />
  </div>
  <div v-else>
    <p>None.</p>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/var' as var;

#user-permission-box {
  margin-left: 1rem;
  max-height: 10rem;
  overflow-y: auto;
}
</style>
