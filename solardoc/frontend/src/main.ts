// Import the global style which is used for the whole app
import '@vueform/vueform/dist/vueform.css'
import './assets/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import Vueform from '@vueform/vueform'
import vueformConfig from '../vueform.config'

const app = createApp(App)

console.log(`[main.ts] Running in '${import.meta.env.MODE}' mode`)

app.use(createPinia())
app.use(Vueform, vueformConfig)
app.use(router)

app.mount('#app')
