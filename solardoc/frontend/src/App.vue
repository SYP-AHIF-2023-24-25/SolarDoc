<script setup lang="ts">
import { RouterView } from 'vue-router';
import Navbar from "./components/Navbar.vue";
</script>

<template>
  <header>
    <Navbar />
  </header>

  <RouterView />
</template>

<style scoped lang="scss">
</style>
