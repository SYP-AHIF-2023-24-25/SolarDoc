import {defineStore} from "pinia";

export const useDarkModeStore = defineStore('darkMode', {
  state: () => {
    return {darkMode: false};
  },
  actions: {
    toggleDarkMode() {
      const html = document.querySelector("html") as HTMLElement;

      /* Dark mode is specified by the 'data-theme' attribute on the <html> tag. */
      if (html.dataset.theme === "dark") {
        html.dataset.theme = "light";
        this.darkMode = false;
      } else {
        html.dataset.theme = "dark";
        this.darkMode = true;
      }
    },
  },
});
