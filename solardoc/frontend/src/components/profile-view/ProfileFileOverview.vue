<script setup lang="ts">
import Files from "@/components/profile-view/Files.vue";
</script>

<template>
  <div id="profile-file-overview">
    <h2>Files</h2>
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