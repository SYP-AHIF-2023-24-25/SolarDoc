<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ModalsContainer } from 'vue-final-modal'
import { useDarkModeStore } from '@/stores/dark-mode'
import ProgressSpinner from '@/components/ProgressSpinner.vue'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'

const darkModeStore = useDarkModeStore()
darkModeStore.setThemeOnHTMLRoot()
</script>

<template>
  <header>
    <Navbar />
  </header>
  <main>
    <RouterView />
    <ModalsContainer />
    <ProgressSpinner />
    <notifications
      classes="styled-notif"
      animation-type="velocity"
      position="bottom right"
      :width="400"
    />
  </main>
  <footer>
    <Footer />
  </footer>
</template>

<style scoped lang="scss">
@use '@/assets/core/var' as var;

header {
  height: var.$nav-bar-height;
  padding: 0;
  margin: 0;
}

main {
  min-height: calc(100vh - var(--nav-bar-height));
  display: flex;
  flex-direction: column;
  align-content: space-around;
}
</style>
