<script setup lang="ts">

import {getHumanReadableTimeInfo} from "@/scripts/format-date";
import {useCurrentUserStore} from "@/stores/current-user";
import type {File} from "@/services/phoenix/api-service";
import {ref} from "vue";
import * as phoenixRestService from "@/services/phoenix/api-service";
import {PhoenixInternalError, PhoenixRestError} from "@/services/phoenix/errors";
import {useCurrentFileStore} from "@/stores/current-file";
import {useRouter} from "vue-router";

const currentUserStore = useCurrentUserStore()
const fileStore = useCurrentFileStore()
const router = useRouter()


let files = ref([] as File[])
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
    files.value = resp.data;
    files.value.sort((a, b) => {
      return new Date(b.last_edited!).getTime() - new Date(a.last_edited!).getTime()
    });
  } else if (resp.status === 401) {
    throw new PhoenixRestError(
        'Server rejected request to fetch current user files. Cause: Unauthorized',
        resp.status,
    )
  }
}

async function openFileInEditor(file: File): Promise<void> {
  fileStore.setFile(file)
  await router.push('/editor')
}

async function deleteFileById(id: string) {
  let resp: Awaited<ReturnType<typeof phoenixRestService.deleteV1FilesById>>
  try {
    resp = await phoenixRestService.deleteV1FilesById(currentUserStore.bearer!,id)
  } catch (e) {
    throw new PhoenixInternalError(
        'Critically failed to delete file. Cause: ' + (<Error>e).message,
    )
  }
  if (resp.status === 204) {
    files.value = files.value.filter(file => file.id !== id)
  } else if (resp.status === 401) {
    throw new PhoenixRestError(
        'Server rejected request to delete file. Cause: Unauthorized',
        resp.status,
    )
  }
}
</script>

<template>
<div id="profile-file-overview-files">
  <div  @click="openFileInEditor(file!)" v-for="file in files" :key="file.id" class="profile-file-overview-file">
    <div class="slide-placeholder"></div>
    <div id="file-infos">
      <p><span>Filename:</span><code>{{file.file_name}}</code></p>
      <p><span>Created:</span><code>{{getHumanReadableTimeInfo(file.created!)}}</code></p>
      <p><span>Last Edited:</span><code>{{getHumanReadableTimeInfo(file.last_edited!)}}</code></p>
    </div>
    <button class="highlighted-button" @click="deleteFileById(file.id!)">Delete</button>
  </div>
</div>
</template>

<style scoped lang="scss">
@use '@/assets/core/var' as var;

#profile-file-overview-files {
  display: flex;
  flex: 0 1;
  flex-flow: column wrap;
  justify-content: space-evenly;
  flex-direction: row;
  row-gap: 1rem;
}

  .slide-placeholder {
    padding: 2.5rem;
    border: 0.15rem solid var.$text-color;
  }


  .profile-file-overview-file {
    padding: 1rem;
    display: flex;
    flex-flow: column wrap;
    justify-content: space-between;
    gap: 1rem;
    border: 0.15rem solid var.$text-color;
    border-radius: 2rem;

    button {
      height: 2rem;
    }

    #file-infos {
      display: flex;
      flex-flow: column wrap;
      gap: 0.4rem;
    }
  }

  .profile-file-overview-file:hover {
    cursor: pointer;
    box-shadow: 0 0 2rem 0 var.$box-shadow-color;
  }

</style>