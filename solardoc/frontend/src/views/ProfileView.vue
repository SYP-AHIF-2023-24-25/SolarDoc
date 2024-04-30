<script setup lang="ts">
import {useCurrentUserStore} from '@/stores/current-user'
import {useCurrentFileStore} from "@/stores/current-file";
import {useRouter} from 'vue-router'
import {PhoenixInternalError, PhoenixRestError} from '@/services/phoenix/errors'
import * as phoenixRestService from "@/services/phoenix/api-service";
import type {File} from "@/services/phoenix/api-service";
import {ref} from "vue";
import {getHumanReadableTimeInfo} from "@solardoc/frontend/src/scripts/format-date";

const currentUserStore = useCurrentUserStore()
const currentFileStore = useCurrentFileStore()
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

async function logout() {
  try {
    await currentUserStore.logout()
    currentFileStore.closeFile()
  } catch (e) {
    if (e instanceof PhoenixRestError && e.errorCode === 401) {
      console.warn(
          '[Profile] User is not logged in (Token gone or expired, user deleted or other reason), redirecting to login page.',
      )
    } else {
      throw e
    }
  }
  await $router.push('/login')
}
</script>

<template>
  <div id="profile-wrapper" class="page-form-wrapper">
    <div id="profile-container" class="page-form-container large">
      <button id="logout-button" class="highlighted-button" @click="logout()">Logout</button>
      <div id="profile-form">
        <h1>
          Profile Page ~<code>{{ currentUserStore.currentUser?.username || '' }}</code>
        </h1>
        <div id="profile-description">
          <p>
            <span>Id:</span><code>{{ currentUserStore.currentUser?.id || '' }}</code>
          </p>
          <p><span>Email:</span> {{ currentUserStore.currentUser?.email || '' }}</p>
          <p><span>Role:</span> {{ currentUserStore.currentUser?.role || '' }}</p>
          <p>
            <span>Confirmed At:</span> {{ currentUserStore.currentUser?.confirmed_at || 'NaN' }}
          </p>
          <p><span>Organisation:</span> {{ currentUserStore.currentUser?.organisation || '' }}</p>
          <p><span>Files:</span></p>
          <v-table :data="files">
            <thead>
            <th>FileName</th>
            <th>Last Edited</th>
            <th>Created</th>
            <th>Actions</th>
            </thead>
            <tbody>
            <tr v-for="row in files" :key="row.id">
              <td>{{ row.file_name }}</td>
              <td>{{ getHumanReadableTimeInfo(row?.last_edited || new Date())}}</td>
              <td>{{ getHumanReadableTimeInfo(row?.created || new Date()) }}</td>
              <td><button  id="editor-button" class="highlighted-button" >Edit</button>
                  <button @click="deleteFileById(row.id || '')" class="highlighted-button">Delete</button></td>
            </tr>
            </tbody>
          </v-table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/var' as var;
@use '@/assets/page-form' as *;
@use '@/assets/core/mixins/align-center' as *;

v-table {
  margin-top: 1rem;
  font-size: 1.5rem;
}

tr, th, td {
  border: 0.01em solid black;
  padding: 0.5rem;

}

#editor-button {
  margin-right: 1rem;
}

#profile-container {
  display: flex;
  position: relative;
  align-content: unset;
  justify-content: unset;

  #logout-button {
    position: absolute;
    top: calc(0.5rem + 40px * 0.67 + 48px - 1.5rem - 4px);
    right: 1.5rem;
    z-index: 101;

    svg {
      width: 1.5rem;
      height: 1.5rem;
      fill: var.$text-color;
    }
  }

  #profile-form {
    flex: 1 1 auto;
    flex-direction: column;
    min-width: 100%;

    h1 {
      // Avoid line break
      white-space: nowrap;
      margin-right: 10rem;
    }

    p {
      margin-bottom: 1rem;
    }

    small {
      font-style: italic;
    }

    code {
      padding: 0 0.25rem;
    }

    span {
      font-weight: bold;
    }
  }
}
</style>
