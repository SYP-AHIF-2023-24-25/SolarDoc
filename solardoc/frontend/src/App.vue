<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ModalsContainer } from 'vue-final-modal'
import Navbar from '@/components/Navbar.vue'
import ProgressSpinner from '@/components/ProgressSpinner.vue'
import {useDarkModeStore} from "@/stores/dark-mode";

const darkModeStore = useDarkModeStore()
darkModeStore.setThemeOnHTMLRoot()
</script>

<template>
  <main>
    <header>
      <Navbar />
    </header>

    <RouterView />
    <ModalsContainer />
    <ProgressSpinner />
    <notifications classes="styled-notif" animation-type="velocity" position="bottom right" :width="400" />
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
