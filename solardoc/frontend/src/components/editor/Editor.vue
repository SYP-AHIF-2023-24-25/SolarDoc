<script lang="ts" setup>
import { onMounted, ref, type Ref } from 'vue'
import { type SubscriptionCallbackMutation } from 'pinia'
import { useDarkModeStore } from '@/stores/dark-mode'
import { useCurrentFileStore } from '@/stores/current-file'
import { SolardocEditor } from '@/scripts/editor/editor'
import { EditorElementNotFoundError } from '@/errors/editor-element-not-found-error'
import { interceptErrors } from '@/errors/handler/error-handler'

const darkModeStore = useDarkModeStore()
const currentFileStore = useCurrentFileStore()

const editorRef = ref(document.querySelector('#editor'))

async function initEditor() {
  if (editorRef.value == null) {
    throw new EditorElementNotFoundError()
  }
  SolardocEditor.initMonacoEditor(<Ref<HTMLElement>>editorRef, {
    darkMode: darkModeStore.darkMode,
    content: currentFileStore.content,
    permissions: currentFileStore.permissions,
  })

  // Register an event listener to the darkModeStore to change the theme of the editor
  darkModeStore.$subscribe(
    (
      mutation: SubscriptionCallbackMutation<{ darkMode: boolean }>,
      state: { darkMode: boolean },
    ) => {
      SolardocEditor.setTheme(state.darkMode)
    },
  )
}

onMounted(async () => await interceptErrors(initEditor()))
</script>

<template>
  <div id="editor" ref="editorRef"></div>
</template>

<style scoped>
#editor {
  width: inherit;
  height: inherit;
  box-sizing: border-box;
}
</style>
