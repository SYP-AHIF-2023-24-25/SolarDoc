import { defineStore } from 'pinia'
import constants from '@/plugins/constants'

export const useFileNameStore = defineStore('fileName', {
  state: () => {
    return {
      fileName: localStorage.getItem(constants.localStorageFileNameKey) || 'untitled.adoc',
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
  },
})
