<script setup lang="ts">
import GlobalFileList from '@/components/collab/GlobalFileList.vue'
import GlobalFileSearch from '@/components/collab/GlobalFileSearch.vue'
import { ref, type Ref } from 'vue'
import type { GlobalSearchQuery } from '@/scripts/collab/search'

const searchQuery: Ref<GlobalSearchQuery> = ref(<GlobalSearchQuery>{})
</script>

<template>
  <div id="global-files-overview">
    <GlobalFileSearch @searchQueryUpdate="payload => (searchQuery = payload)" />
    <GlobalFileList :searchQuery="searchQuery" />
  </div>
</template>

<style scoped lang="scss">
#global-files-overview {
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
}
</style>
