<script lang="ts" setup>
import { getHumanReadableTimeInfo } from '@/scripts/format-date'
import type { File } from '@/services/phoenix/gen/phoenix-rest-service'
import * as phoenixRestService from '@/services/phoenix/api-service'
import {
  type ActualPhxErrorResp,
  PhoenixBadRequestError,
  PhoenixInternalError,
  PhoenixInvalidCredentialsError,
} from '@/services/phoenix/errors'
import { useCurrentUserStore } from '@/stores/current-user'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { interceptErrors } from '@/errors/handler/error-handler'
import {openFileInEditor} from "@/scripts/editor/file";

const props = defineProps<{ file: File }>()
const deleted = ref(false)

const currentUserStore = useCurrentUserStore()
const $router = useRouter()

async function deleteFile() {
  let resp: Awaited<ReturnType<typeof phoenixRestService.deleteV1FilesById>>
  try {
    resp = await phoenixRestService.deleteV1FilesById(currentUserStore.bearer!, props.file.id)
  } catch (e) {
    throw new PhoenixInternalError('Critically failed to delete file. Cause: ' + (<Error>e).message)
  }
  if (resp.status === 204) {
    deleted.value = true
  } else if (resp.status === 400) {
    throw new PhoenixBadRequestError(
      'Server rejected request to delete file',
      resp.data as ActualPhxErrorResp,
    )
  } else if (resp.status === 401) {
    currentUserStore.clean()
    await $router.push('/login')
    throw new PhoenixInvalidCredentialsError(
      'Server rejected request to delete file',
      'Your saved token is invalid or has already been revoked. Please log in again.',
    )
  }
}

// Last modified and created are refs which is updated every 0.5 second to show the last modified time
const lastModified = ref(getLastModified())
const created = ref(getCreated())

function getLastModified(): string {
  return getHumanReadableTimeInfo(props.file.last_edited)
}

function getCreated(): string {
  return getHumanReadableTimeInfo(props.file.created)
}

setInterval(() => {
  lastModified.value = getLastModified()
  created.value = getCreated()
}, 500)
</script>

<template>
  <div v-if="!deleted" class="profile-file-overview-file">
    <div id="slide-placeholder" @click="openFileInEditor($router, file)"></div>
    <div id="file-infos">
      <p>
        <span>Filename:</span><code>{{ file.file_name }}</code>
      </p>
      <p>
        <span>Last Edited:</span><code>{{ lastModified }}</code>
      </p>
      <p>
        <span>Created:</span><code>{{ created }}</code>
      </p>
    </div>
    <button class="highlighted-button" @click="interceptErrors(deleteFile())">Delete</button>
  </div>
</template>

<style lang="scss" scoped>
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
    background-color: var.$placeholder-background;

    &::before {
      content: '???';
      color: var.$text-color;
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
      background-color: var.$placeholder-background;
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
    width: calc(var(--profile-file-card-width) - 2 * 1rem);
    overflow-x: scroll;
    gap: 0.4rem;

    /* Hide scrollbar for Chrome, Safari and Opera */
    &::-webkit-scrollbar {
      display: none;
    }

    /* Hide scrollbar for IE, Edge and Firefox */
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */

    p,
    p * {
      display: flex;
      white-space: nowrap;
      margin: 0;
    }

    code {
      padding: 0 0 0 0.5rem;
    }
  }

  &:hover {
    cursor: pointer;
    box-shadow: 0 0 2rem 0 var.$box-shadow-color;
  }
}
</style>
