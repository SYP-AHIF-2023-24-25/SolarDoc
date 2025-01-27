<script setup lang="ts">
import Toggle from '@vueform/toggle'
import type {
  FilePermission,
  UpdateFilePermissions,
} from '@/services/phoenix/gen/phoenix-rest-service'
import { ref } from 'vue'
import type { Awaited } from '@vueuse/core'
import * as phoenixRestService from '@/services/phoenix/api-service'
import { useCurrentUserStore } from '@/stores/current-user'
import {
  type ActualPhxErrorResp,
  PhoenixBadRequestError,
  PhoenixInternalError,
} from '@/services/phoenix/errors'
import UserRef from '@/components/common/UserRef.vue'

const props = defineProps<{ filePermission: FilePermission }>()

const currentUserStore = useCurrentUserStore()

const permissionValue = ref(props.filePermission.permission === 3)
const currentPermission = ref(permissionValue.value ? 'read & write' : 'read')
const permissionNumber = ref(props.filePermission.permission)

function changePermission() {
  if (currentPermission.value === 'read & write') {
    currentPermission.value = 'read'
    permissionNumber.value = 1
  } else {
    currentPermission.value = 'read & write'
    permissionNumber.value = 3
  }
}

async function saveChanges() {
  let resp: Awaited<ReturnType<typeof phoenixRestService.putV2FilesPermissionsById>>
  try {
    const updatePermission: UpdateFilePermissions = {
      file_id: props.filePermission.file_id,
      user_id: props.filePermission.user_id,
      permission: permissionNumber.value,
    }
    resp = await phoenixRestService.putV2FilesPermissionsById(
      currentUserStore.bearer!,
      props.filePermission.id!,
      updatePermission,
    )
  } catch (e) {
    throw new PhoenixInternalError(
      'Critically failed to update file permissions. Cause: ' + (<Error>e).message,
    )
  }
  if (resp.status === 200) {
    // TODO! Fix this, it's a dirty hack
    // eslint-disable-next-line vue/no-mutating-props
    props.filePermission.permission = resp.data.permission
  } else if (resp.status === 400) {
    throw new PhoenixBadRequestError(
      'Server rejected request to update file permission',
      resp.data as ActualPhxErrorResp,
    )
  }
}
</script>

<template>
  <div id="user-permission-card">
    <p>
      <span>User:</span>
      <UserRef :id="filePermission.user_id" :user-name="filePermission.username" />
    </p>
    <p>
      <span id="permission-text">Permission:</span>
      <Toggle v-model="permissionValue" @change="changePermission" />
      <code id="toggle">{{ currentPermission }}</code>
      <button
        id="save-button"
        class="highlighted-button"
        :disabled="filePermission.permission === permissionNumber"
        @click="saveChanges"
      >
        Save changes
      </button>
    </p>
  </div>
</template>

<style src="@vueform/toggle/themes/default.css"></style>

<style scoped lang="scss">
#user-permission-card {
  padding-bottom: 1rem;

  span {
    font-weight: bold;
  }

  #permission-text {
    padding-right: 1rem;
  }

  #toggle {
    margin-left: 1rem;
  }

  #save-button {
    float: right;
    margin-right: 5rem;
  }
}
</style>
