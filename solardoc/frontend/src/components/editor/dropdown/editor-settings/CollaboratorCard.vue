<script setup lang="ts">
import Toggle from '@vueform/toggle'
import {
  type FilePermissions,
  putV1FilePermissionById,
  type UpdateFilePermissions
} from "@/services/phoenix/gen/phoenix-rest-service"
import { ref } from "vue"
import type {Awaited} from "@vueuse/core";
import * as phoenixRestService from '@/services/phoenix/api-service'
import {useCurrentUserStore} from "@/stores/current-user";
import {type ActualPhxErrorResp, PhoenixBadRequestError, PhoenixInternalError} from "@/services/phoenix/errors";

const props = defineProps<{ filePermission: FilePermissions }>()
const permissionValue = ref(props.filePermission.permission === 3)
const currentUserStore = useCurrentUserStore();
const currentPermission = ref(permissionValue.value ? "read & write" : "read")
let permissionNumber = props.filePermission.permission;
function changePermission() {

  if(currentPermission.value === "read & write"){
    currentPermission.value = "read"
    permissionNumber = 1;
  }
  else{
    currentPermission.value = "read & write";
    permissionNumber = 3;
  }
}

async function saveChanges() {
  let resp: Awaited<ReturnType<typeof phoenixRestService.putV1FilePermissionById>>
  try {
    const updatePermission: UpdateFilePermissions = {
      file_id: props.filePermission.file_id,
      user_id: props.filePermission.user_id,
      permission: permissionNumber
    }
    resp = await phoenixRestService.putV1FilePermissionById(currentUserStore.bearer!, props.filePermission.id!, updatePermission )
  } catch (e) {
    throw new PhoenixInternalError('Critically failed to update file permissions. Cause: ' + (<Error>e).message);
  }
  if(resp.status === 200){
    props.filePermission.permission = resp.data.permission;
  }else if(resp.status === 400){
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
      <span>User:</span><code>{{ filePermission.user_id }}</code>
    </p>
    <p>
      <span id="permission-text">Permission:</span>
      <Toggle  v-model="permissionValue" @change="changePermission" />
      <code id="toggle">{{ currentPermission }}</code>
      <button id="save-button" class="highlighted-button" :disabled="filePermission.permission === permissionNumber" @click="saveChanges">Save changes</button>
    </p>
  </div>
</template>

<style src="@vueform/toggle/themes/default.css"></style>

<style scoped lang="scss">
  #user-permission-card{
    padding-bottom: 1rem;
    span {
      font-weight: bold;
    }
    #permission-text{
      padding-right: 1rem
    }
    #toggle{
      margin-left: 1rem;
    }
    #save-button{
      float: right;
      margin-right: 5rem;
    }
  }
</style>