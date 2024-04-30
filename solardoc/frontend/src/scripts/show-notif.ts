import { type NotificationsOptions, useNotification } from '@kyvg/vue3-notification'
import type { NotifiableError } from '@/errors/solardoc-error'

export type NotificationType = Exclude<NotificationsOptions['type'], undefined>
const duration: Record<NotificationType, number> = {
  error: 20000,
  warn: 15000,
  info: 10000,
  success: 5000,
}
const { notify } = useNotification()

export function showErrorNotifFrom(error: NotifiableError): void {
  showErrorNotif(`${error.notifName}: ${error.notifMessage}`, error.notifDescription)
}

export function showErrorNotifFromObj(obj: { title: string; text: string }): void {
  showErrorNotif(obj.title, obj.text)
}

export function showErrorNotif(title: string, text: string): void {
  showNotif('error', title, text)
}

export function showWarnNotifFrom(error: NotifiableError & { isWarn: true }): void {
  showWarnNotif(`${error.notifName}: ${error.notifMessage}`, error.notifDescription)
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
