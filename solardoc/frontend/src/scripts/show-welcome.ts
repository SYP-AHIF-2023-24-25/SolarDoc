import { useWelcomeStore } from '@/stores/welcome'
import constants from '@/plugins/constants'
import { showInfoNotif } from '@/scripts/show-notif'

const welcomeStore = useWelcomeStore()

export function showWelcomeIfNeverShownBefore(): void {
  if (!welcomeStore.showWelcome) {
    return
  }

  showInfoNotif(constants.notifMessages.welcome.title, constants.notifMessages.welcome.description)
  welcomeStore.setWelcomeShown(true)
}
