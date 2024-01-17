import { defineStore } from 'pinia'
import constants from "@/plugins/constants";

export const useFileNameStore = defineStore('fileName', {
  state: () => {
    return {
      fileName: localStorage.getItem(constants.localeStorageFileNameKey) || 'untitled.adoc'
    }
  },
  actions: {
    setFileName(fileName: string) {
      this.fileName = fileName
      localStorage.setItem(constants.localeStorageFileNameKey, fileName)
    },
    storeLocally() {
      localStorage.setItem(constants.localeStorageFileNameKey, this.fileName)
    }
  },
})
