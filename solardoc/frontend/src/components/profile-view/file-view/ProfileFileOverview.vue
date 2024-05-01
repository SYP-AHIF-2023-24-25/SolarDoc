<script setup lang="ts">
import Files from "@/components/profile-view/file-view/Files.vue";
import SearchBar from "@/components/profile-view/file-view/SearchBar.vue";
</script>

<template>
  <div id="profile-file-overview">
    <h2>Files</h2>
    <SearchBar />
    <Files />
  </div>
</template>

<style scoped lang="scss">
#profile-file-overview {
  width: 100%;

  #profile-file-overview-container {
    display: flex;
    flex: 1 1 auto;
    flex-flow: column nowrap;
    gap: 1rem;

    h2 {
      font-size: 1.5rem;
    }

  }

}
</style>