import {defineStore} from "pinia";
import constants from "@/plugins/constants";

export const useEditorContentStore = defineStore('editorContent', {
  state: () => {
    return {
      editorContent: localStorage.getItem(constants.localStorageTextKey)
        || '= Welcome to SolarDoc! \n\n== Your AsciiDoc web-editor °^°'
    }
  },
  actions: {
    setEditorContent(editorContent: string) {
      this.editorContent = editorContent
      localStorage.setItem(constants.localStorageTextKey, editorContent)
    },
  },
})
