import {useWelcomeStore} from '@/stores/welcome'
import constants from '@/plugins/constants'
import {showInfoNotifFromObj} from '@/scripts/show-notif'

const welcomeStore = useWelcomeStore()

export function showWelcomeIfNeverShownBefore(): void {
  if (!welcomeStore.showWelcome) {
    return
  }

  showInfoNotifFromObj(constants.notifMessages.welcome)
  welcomeStore.setWelcomeShown(true)
}
