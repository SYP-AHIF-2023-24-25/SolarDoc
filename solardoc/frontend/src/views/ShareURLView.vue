<script setup lang="ts">

//{{ $route.params.id }}
import ProgressSpinner from "@/App.vue";
import {useCurrentFileStore} from "@/stores/current-file";
import {onMounted} from "vue";
import * as phoenixRestService from '@/services/phoenix/api-service'
import {useCurrentUserStore} from "@/stores/current-user";
import {useRoute, useRouter} from "vue-router";
import {PhoenixInternalError, PhoenixRestError} from "@/services/phoenix/errors";

const currentFileStore = useCurrentFileStore();
const currentUserStore = useCurrentUserStore();

const $route = useRoute();
const $router = useRouter()


onMounted(async ()=>{
  const shareUrlId = $route.params.share_url_id;

  if (typeof currentUserStore.bearer === 'string') {
    if(typeof shareUrlId === 'string'){


      let resp: Awaited<ReturnType<typeof phoenixRestService.getV1ShareById>>
      try {
        resp = await phoenixRestService.getV1ShareById( currentUserStore.bearer,shareUrlId)
      } catch (e) {
        throw new PhoenixInternalError(
            'Critically failed to fetch current user. Cause: ' + (<Error>e).message,
        )
      }

      if (resp.status === 401) {
        throw new PhoenixRestError(
            'Server rejected request to fetch current user. Cause: Unauthorized',
            resp.status,
        )
      }
      else if(resp.status === 200){
          currentFileStore.setContent(resp.data.content);
          currentFileStore.setFileId(resp.data.id);
          currentFileStore.setFileName(resp.data.file_name);

          await $router.push('/editor');

      }
    }
  }
  else{
    await $router.push('/login');
  }
})

</script>

<template>
<ProgressSpinner></ProgressSpinner>
</template>

<style scoped lang="scss">

</style>