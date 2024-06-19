<script lang="ts" setup>
import { RouterView} from 'vue-router'
import { ModalsContainer } from 'vue-final-modal'
import { useDarkModeStore } from '@/stores/dark-mode'
import ProgressSpinner from '@/components/ProgressSpinner.vue'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'

const NO_FOOTER_ROUTES = [
  'test-editor',
  'editor'
]

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
      :width="400"
      animation-type="velocity"
      classes="styled-notif"
      position="bottom right"
    />
  </main>
  <footer v-show="!NO_FOOTER_ROUTES.includes(String($route.name))">
    <Footer />
  </footer>
</template>

<style lang="scss" scoped>
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
