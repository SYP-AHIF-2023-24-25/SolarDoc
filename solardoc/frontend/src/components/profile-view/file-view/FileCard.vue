<script setup lang="ts">
import { getHumanReadableTimeInfo } from '@/scripts/format-date'
import type { File } from '@/services/phoenix/gen/phoenix-rest-service'
import * as phoenixRestService from '@/services/phoenix/api-service'
import { PhoenixInternalError, PhoenixRestError } from '@/services/phoenix/errors'
import { useCurrentUserStore } from '@/stores/current-user'
import { useCurrentFileStore } from '@/stores/current-file'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const props = defineProps<{ file: File }>()
const deleted = ref(false)

const currentUserStore = useCurrentUserStore()
const fileStore = useCurrentFileStore()
const router = useRouter()

async function openFileInEditor(): Promise<void> {
  fileStore.setFile(props.file)
  await router.push('/editor')
}

async function deleteFileById() {
  let resp: Awaited<ReturnType<typeof phoenixRestService.deleteV1FilesById>>
  try {
    resp = await phoenixRestService.deleteV1FilesById(currentUserStore.bearer!, props.file.id)
  } catch (e) {
    throw new PhoenixInternalError('Critically failed to delete file. Cause: ' + (<Error>e).message)
  }
  if (resp.status === 204) {
    deleted.value = true
  } else if (resp.status === 401) {
    throw new PhoenixRestError(
      'Server rejected request to delete file. Cause: Unauthorized',
      resp.status,
    )
  }
}
</script>

<template>
  <div class="profile-file-overview-file" v-if="!deleted">
    <div id="slide-placeholder" @click="openFileInEditor()"></div>
    <div id="file-infos">
      <p>
        <span>Filename:</span><code>{{ file.file_name }}</code>
      </p>
      <p>
        <span>Created:</span><code>{{ getHumanReadableTimeInfo(file.created!) }}</code>
      </p>
      <p>
        <span>Last Edited:</span><code>{{ getHumanReadableTimeInfo(file.last_edited!) }}</code>
      </p>
    </div>
    <button class="highlighted-button" @click="deleteFileById()">Delete</button>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/var' as var;

.profile-file-overview-file {
  display: flex;
  height: var.$profile-file-card-height;
  width: var.$profile-file-card-width;
  flex-flow: column wrap;
  justify-content: space-between;
  border: 0.15rem solid var.$text-color;
  border-radius: 1rem;
  margin: 0 1rem;
  padding: 1rem;
  gap: 1rem;

  button {
    height: 2rem;
  }

  #slide-placeholder {
    $border-width: 3px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;

    // We will simulate the size of a presentation so 2:1 ratio
    width: 100%;
    padding-top: 50%;
    border-radius: $border-width;

    // Show an X in the middle to serve as a placeholder
    background-color: var.$scheme-gray-100;

    &::before {
      content: '???';
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      position: absolute;
      justify-content: center;
      align-content: center;
      flex-wrap: wrap;
      z-index: 101;
      font-size: 0.75rem;
      border-radius: $border-width;
      background-color: var.$scheme-gray-100;
    }

    &:hover::after {
      z-index: 99;
      position: absolute;
      content: '';
      top: calc(-1 * $border-width);
      left: calc(-1 * $border-width);
      width: calc(100% + $border-width * 2);
      height: calc(100% + $border-width * 2);
      background: linear-gradient(
        60deg,
        hsl(224, 85%, 66%),
        hsl(269, 85%, 66%),
        hsl(314, 85%, 66%),
        hsl(359, 85%, 66%),
        hsl(44, 85%, 66%),
        hsl(89, 85%, 66%),
        hsl(134, 85%, 66%),
        hsl(179, 85%, 66%)
      );
      background-size: 300% 300%;
      background-position: 0 50%;
      border-radius: calc(2 * $border-width);
      animation: moveGradient 4s alternate infinite;
    }

    @keyframes moveGradient {
      50% {
        background-position: 100% 50%;
      }
    }
  }

  #file-infos {
    display: flex;
    flex-flow: column wrap;
    gap: 0.4rem;
  }

  &:hover {
    cursor: pointer;
    box-shadow: 0 0 2rem 0 var.$box-shadow-color;
  }
}
</style>
