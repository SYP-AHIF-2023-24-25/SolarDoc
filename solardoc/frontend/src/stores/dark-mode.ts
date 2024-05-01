import { defineStore } from 'pinia'
import constants from '@/plugins/constants'

export const useDarkModeStore = defineStore('darkMode', {
  state: () => {
    const darkMode = localStorage.getItem(constants.localStorageThemeKey) === 'dark'
    return { darkMode: darkMode }
  },
  getters: {
    theme(): string {
      return this.darkMode ? 'dark' : 'light'
    },
  },
  actions: {
    setThemeOnHTMLRoot() {
      const html = document.querySelector('html') as HTMLElement

      /* Dark mode is specified by the 'data-theme' attribute on the <html> tag. */
      html.dataset.theme = this.theme
    },
    toggleDarkMode() {
      this.setDarkMode(!this.darkMode)
    },
    setDarkMode(value: boolean) {
      this.darkMode = value
      localStorage.setItem(constants.localStorageThemeKey, this.theme)
      this.setThemeOnHTMLRoot()
    },
  },
})
