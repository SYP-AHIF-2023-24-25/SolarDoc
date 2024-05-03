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
  <main>
    <header>
      <Navbar />
    </header>

    <RouterView />
    <ModalsContainer />
    <ProgressSpinner />
    <notifications
      classes="styled-notif"
      animation-type="velocity"
      position="bottom right"
      :width="400"
    />

    <footer>
      <Footer />
    </footer>
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
