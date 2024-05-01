<script setup lang="ts">
import FilesList from '@/components/profile-view/file-view/FilesList.vue'
import SearchBar from '@/components/profile-view/file-view/SearchBar.vue'
</script>

<template>
  <div id="profile-file-overview">
    <h1 id="profile-file-overview-header">Files</h1>
    <div id="profile-file-overview-content">
      <SearchBar />
      <FilesList />
    </div>
  </div>
</template>

<style scoped lang="scss">
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
