import { type NotificationsOptions, useNotification } from '@kyvg/vue3-notification'
import type { NotifiableError } from '@/errors/solardoc-error'

export type NotificationType = Exclude<NotificationsOptions['type'], undefined>
const duration: Record<NotificationType, number> = {
  error: 20000,
  warn: 15000,
  info: 12000,
  success: 10000,
}
const { notify } = useNotification()

/**
 * Shows a notification based on an error.
 * @param error The error to show a notification for.
 * @since 0.6.0
 */
export function showNotifFromErr(error: NotifiableError): void {
  if (error.isWarn) {
    showWarnNotifFromErr(error as NotifiableError & { isWarn: true })
  } else {
    showErrorNotifFromErr(error)
  }
}

function showErrorNotifFromErr(error: NotifiableError): void {
  showErrorNotif(`${error.notifName}: ${error.notifMessage}`, error.notifDescription)
}

export function showErrorNotifFromObj(obj: { title: string; text: string }): void {
  showErrorNotif(obj.title, obj.text)
}

export function showErrorNotif(title: string, text: string): void {
  showNotif('error', title, text)
}

export function showWarnNotifFromErr(error: NotifiableError & { isWarn: true }): void {
  showWarnNotif(`${error.notifName}: ${error.notifMessage}`, error.notifDescription)
}

export function showWarnNotifFromObj(obj: { title: string; text: string }): void {
  showWarnNotif(obj.title, obj.text)
}

export function showWarnNotif(title: string, text: string): void {
  showNotif('warn', title, text)
}

export function showInfoNotifFromObj(obj: { title: string; text: string }): void {
  showInfoNotif(obj.title, obj.text)
}

export function showInfoNotif(title: string, text: string): void {
  showNotif('info', title, text)
}

export function showSuccessNotifFromObj(obj: { title: string; text: string }): void {
  showSuccessNotif(obj.title, obj.text)
}

export function showSuccessNotif(title: string, text: string): void {
  showNotif('success', title, text)
}

export function showNotif(type: NotificationType, title: string, text: string): void {
  notify({
    type: type,
    title: title,
    text: text,
    duration: duration[type],
  })
}
