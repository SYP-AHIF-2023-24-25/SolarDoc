import { defineStore } from 'pinia'
import constants from '@/plugins/constants'

export const useFileStore = defineStore('fileName', {
  state: () => {
    return {
      fileName: localStorage.getItem(constants.localStorageFileNameKey) || 'untitled.adoc',
      saveState: 'Saved Locally'
    }
  },
  actions: {
    setFileName(fileName: string) {
      this.fileName = fileName
      localStorage.setItem(constants.localStorageFileNameKey, fileName)
    },
    storeLocally() {
      localStorage.setItem(constants.localStorageFileNameKey, this.fileName)
    },
    storeOnServer() {
      //TODO! add liss stuff
      this.saveState = 'Saved Remotely'
    }
  },
})
