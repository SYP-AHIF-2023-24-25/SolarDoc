import {useWelcomeStore} from "@/stores/welcome"
import {useNotification} from "@kyvg/vue3-notification"
import constants from "@/plugins/constants"

const welcomeStore = useWelcomeStore()

const { notify } = useNotification()

export function showWelcomeIfNeverShownBefore(): void {
  if (!welcomeStore.showWelcome) {
    return
  }

  notify({
    type: 'info',
    title: constants.notifMessages.welcome.title,
    text: constants.notifMessages.welcome.description,
    duration: 10000,
  })
  welcomeStore.setWelcomeShown(true)
}
