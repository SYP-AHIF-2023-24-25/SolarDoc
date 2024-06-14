<script lang="ts" setup>
import FilesList from '@/components/profile-view/file-view/FilesList.vue'
import SearchBar from '@/components/profile-view/file-view/SearchBar.vue'
import {ref} from "vue";

const query = ref('')
</script>

<template>
  <div id="profile-file-overview">
    <h1 id="profile-file-overview-header">Files</h1>
    <div id="profile-file-overview-content">
      <SearchBar @searchQueryUpdate="payload => query = payload" />
      <FilesList :searchQuery="query" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
#profile-file-overview {
  display: flex;
  flex-flow: column nowrap;
  width: 100%;

  #profile-file-overview-content {
    display: flex;
    flex: 1 1 auto;
    flex-flow: column nowrap;
    gap: 2rem;

    & > :first-child {
      /* SearchBar */
      width: 100%;
      flex-flow: row nowrap;
      justify-content: start;
    }
  }
}
</style>
