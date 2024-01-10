import {defineStore} from "pinia";

export const useFileNameStore = defineStore('fileName', {
  state: () => {
    return { fileName: '' }
  },
  actions: {
    setFileName(fileName: string) {
      this.fileName = fileName
    },
  },
})
