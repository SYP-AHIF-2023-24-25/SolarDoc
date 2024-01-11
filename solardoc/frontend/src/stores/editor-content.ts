import { defineStore } from 'pinia'

export const useEditorContentStore = defineStore('editorContent', {
  state: () => {
    return { editorContent: '' }
  },
  actions: {
    setEditorContent(editorContent: string) {
      this.editorContent = editorContent
    },
  },
})
