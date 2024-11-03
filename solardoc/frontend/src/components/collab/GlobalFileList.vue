<script setup lang="ts">
import {ref, watch} from "vue";
import type {GlobalSearchQuery} from "@/scripts/collab/search";
import type {GlobalFile} from "@/services/phoenix/gen/phoenix-rest-service";
import {PhoenixInternalError, PhoenixInvalidCredentialsError} from "@/services/phoenix/errors";
import {handleError} from "@/errors/handler/error-handler";
import * as phoenixRestService from "@/services/phoenix/api-service";
import GlobalFileCard from "@/components/collab/GlobalFileCard.vue";
import {useCurrentUserStore} from "@/stores/current-user";
import {useRouter} from "vue-router";
import MinorProgressSpinner from "@/components/common/MinorProgressSpinner.vue";

const currentUserStore = useCurrentUserStore()
const $router = useRouter()

const props = defineProps<{ searchQuery: GlobalSearchQuery }>()

const files = ref<Array<GlobalFile>>([])
const loading = ref(true)
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

async function fetchFiles(bearer: string, options: GlobalSearchQuery = {}) {
  let resp: Awaited<ReturnType<typeof phoenixRestService.getV2Files>>
  try {
    resp = await phoenixRestService.getV2FilesGlobal(bearer, options)
  } catch (e) {
    throw new PhoenixInternalError(
      'Critically failed to fetch current user. Cause: ' + (<Error>e).message,
    )
  }

  if (resp.status === 200) {
    files.value = resp.data satisfies Array<GlobalFile>
    files.value.sort((a, b) => {
      return new Date(b.last_edited).getTime() - new Date(a.last_edited).getTime()
    })
    loading.value = false
  } else if (resp.status === 401) {
    currentUserStore.clean()
    await $router.push('/login')
    throw new PhoenixInvalidCredentialsError(
      'Server rejected request to load the collaboration tab',
      'You need to be logged in to access this site.',
    )
  }
}

// We have to make sure there is a cooldown on how often requests are made
// to the server. This is to prevent spamming the server with requests.

let cooldown: NodeJS.Timeout | null = null
watch(props, async (newVal) => {
  if (cooldown) {
    clearTimeout(cooldown)
  }
  loading.value = true
  files.value = []
  cooldown = setTimeout(async () => {
    await fetchFiles(currentUserStore.bearer!, newVal.searchQuery)
  }, 400)
})
</script>

<template>
  <div id="global-files">
    <template v-if="loading">
      <div id="loading-files">
        <p class="gradient-text">Loading...</p>
        <MinorProgressSpinner />
      </div>
    </template>
    <template v-else-if="files.length > 0">
      <p id="files-available">
        Found {{ files.length }} files ー Page 1/1
      </p>
      <div id="global-files-search-result">
        <GlobalFileCard
          v-for="file in files"
          :key="file.id"
          :file="file"
        />
      </div>
    </template>
    <template v-else>
      <div id="no-results">
        <p>Bad luck :( No files found</p>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/gradient-text' as *;
@use '@/assets/core/mixins/screen-size' as *;
@use '@/assets/core/var' as var;

#global-files {
  display: flex;
  flex-flow: column wrap;
  gap: 1rem;

  #files-available {
    font-size: 0.8rem;
    margin: 0.75rem 2rem 0 1.5rem;
  }

  #global-files-search-result {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-evenly;
    margin: 1rem 2rem;
  }

  #loading-files,
  #no-results {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: 100%;
    width: 100%;
    margin: 4rem 0 1rem 0;

    p {
      font-size: 2rem;

      @include r-min(var.$window-medium) {
        font-size: 2.5em;
      }
    }
  }
}
</style>
