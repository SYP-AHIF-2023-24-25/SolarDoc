<script setup lang="ts">
import { RouterView } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import ProgressSpinner from "@/components/ProgressSpinner.vue";
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
