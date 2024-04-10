import { defineStore } from 'pinia'
import constants from '@/plugins/constants'

export const useFileStore = defineStore('fileName', {
  state: () => {
    return {
      fileName: localStorage.getItem(constants.localStorageFileKey) || 'untitled.adoc',
      saveState: 'Saved Locally',
    }
  },
  actions: {
    async storeOnServer() {
      this.saveState = 'Saved Remotely'
    },
    storeLocally() {
      localStorage.setItem(constants.localStorageFileKey, this.fileName)
    },
    setFileName(fileName: string) {
      this.fileName = fileName
      localStorage.setItem(constants.localStorageFileKey, fileName)
    },
  },
})
