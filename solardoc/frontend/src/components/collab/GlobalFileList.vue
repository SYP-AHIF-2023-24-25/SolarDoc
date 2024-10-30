<script setup lang="ts">
import {ref} from "vue";
import type {GlobalSearchQuery} from "@/scripts/collab/search";
import type {File, GlobalFile} from "@/services/phoenix/gen/phoenix-rest-service";
import {PhoenixInternalError, PhoenixInvalidCredentialsError} from "@/services/phoenix/errors";
import {handleError} from "@/errors/handler/error-handler";
import * as phoenixRestService from "@/services/phoenix/api-service";
import GlobalFileCard from "@/components/collab/GlobalFileCard.vue";
import {useCurrentUserStore} from "@/stores/current-user";
import {useRouter} from "vue-router";

const currentUserStore = useCurrentUserStore()
const $router = useRouter()

defineProps<{ searchQuery: GlobalSearchQuery }>()

const files = ref<Array<GlobalFile>>([])
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
    files.value = resp.data satisfies Array<File>
    files.value.sort((a, b) => {
      return new Date(b.last_edited).getTime() - new Date(a.last_edited).getTime()
    })
  } else if (resp.status === 401) {
    currentUserStore.clean()
    await $router.push('/login')
    throw new PhoenixInvalidCredentialsError(
      'Server rejected request to load the collaboration tab',
      'You need to be logged in to access this site.',
    )
  }
}
</script>

<template>
  <div id="global-files">
    <GlobalFileCard
      v-for="file in files"
      :key="file.id"
      :file="file"
    />
  </div>
</template>

<style scoped lang="scss">
#global-files {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-evenly;
  margin: 2rem;
  gap: 1rem;
}
</style>
