// Import the global style which is used for the whole app
import '@vueform/vueform/dist/vueform.css'
import '@/assets/main.scss'
import '@/assets/tooltip.scss'
import 'vue-final-modal/style.css'
import 'primeicons/primeicons.css'
import './assets/main.scss'

import {createApp} from 'vue'
import {createPinia} from 'pinia'
import {createVfm} from 'vue-final-modal'
import Vueform from '@vueform/vueform'
import Notifications from '@kyvg/vue3-notification'
import velocity from 'velocity-animate'
import App from './App.vue'
import router from './router'
import tooltip from './directives/tooltip'
import vueformConfig from '../vueform.config'

const vfm = createVfm()
const app = createApp(App)

console.log(`[main.ts] Running in '${import.meta.env.MODE}' mode`)

app
  .use(router)
  .use(createPinia())
  .use(Vueform, vueformConfig)
  .use(vfm)
  .use(Notifications, { velocity })
  .directive('tooltip', tooltip)
  .mount('#app')
