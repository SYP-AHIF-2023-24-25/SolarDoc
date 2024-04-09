// Import the global style which is used for the whole app
import '@vueform/vueform/dist/vueform.css'
import '@/assets/main.scss'
import "@/assets/tooltip.scss"
import 'vue-final-modal/style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVfm } from 'vue-final-modal'
import App from './App.vue'
import router from './router'
import Vueform from '@vueform/vueform'
import tooltip from "./directives/tooltip"

import vueformConfig from '../vueform.config'

const app = createApp(App)

console.log(`[main.ts] Running in '${import.meta.env.MODE}' mode`)

app.use(createPinia())
app.use(Vueform, vueformConfig)
app.use(router)

const vfm = createVfm()
app.use(vfm)

app.directive("tooltip", tooltip);
app.mount('#app')
