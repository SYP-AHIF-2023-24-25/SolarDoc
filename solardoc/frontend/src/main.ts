import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVfm } from 'vue-final-modal'

// The main App component
import App from './App.vue'

const vfm = createVfm()
const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

import vueform from '@vueform/vueform'
import notifications from '@kyvg/vue3-notification'
import velocity from 'velocity-animate'
import tooltip from './directives/tooltip'
import vueformConfig from '../vueform.config'

console.log(`[main.ts] Running in '${import.meta.env.MODE}' mode`)

const router = (await import('./router')).default
app
  .use(router)
  .use(vueform, vueformConfig)
  .use(vfm)
  .use(notifications, { velocity })
  .directive('tooltip', tooltip)
  .mount('#app')

// Import the global style which is used for the whole app
import '@vueform/vueform/dist/vueform.css'
import '@/assets/main.scss'
import '@/assets/tooltip.scss'
import 'vue-final-modal/style.css'
import 'primeicons/primeicons.css'
import './assets/main.scss'
