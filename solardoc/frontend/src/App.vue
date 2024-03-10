<script setup lang="ts">
import { RouterView } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import ProgressSpinner from '@/components/ProgressSpinner.vue'
import * as phoenixBackend from "@/services/phoenix/api-service";

phoenixBackend
    .checkIfPhoenixBackendIsReachable()
    .then(void 0)
    .catch((error: Error) => {
      if (error) {
        console.error(error)
      }
      throw new Error('Phoenix Backend is not reachable. Please copy the logs and contact the developers.')
    })
</script>

<template>
  <main>
    <header>
      <Navbar />
    </header>

    <RouterView />
    <ProgressSpinner />
  </main>
</template>

<style scoped lang="scss">
main {
  display: flex;
  flex-direction: column;

  header {
    padding: 0;
    margin: 0;
  }
}
</style>
