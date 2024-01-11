<script setup lang="ts">
import { RouterView } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import ProgressSpinner from '@/components/ProgressSpinner.vue'
import { useEditorContentStore } from '@/stores/editor-content'
import constants from '@/plugins/constants'

const editorContentStore = useEditorContentStore()

// Load the text from the locale storage
let initText =
  localStorage.getItem(constants.localStorageTextKey) ||
  '= Welcome to SolarDoc! \n\n== Your AsciiDoc web-editor °^°'
editorContentStore.setEditorContent(initText)
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
