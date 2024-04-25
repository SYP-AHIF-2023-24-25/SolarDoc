import {defineStore} from "pinia";
import constants from "@/plugins/constants";

export const useWelcomeStore = defineStore('welcomeState', {
  state: () => {
    const welcomeShown = localStorage.getItem(constants.localStorageWelcomeShownKey) === 'true'
    return {
      showWelcome: !welcomeShown,
    }
  },
  actions: {
    setWelcomeShown(value: boolean) {
      this.showWelcome = value
      localStorage.setItem(constants.localStorageWelcomeShownKey, value ? 'true' : 'false')
    }
  }
})
