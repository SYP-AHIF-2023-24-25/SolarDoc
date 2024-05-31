import {isDev} from '@/config/env'

export const PHOENIX_URL = isDev
  ? `${import.meta.env.DEV_PHOENIX_HOST}${
      `${import.meta.env.DEV_PHOENIX_PORT}`.trim() ? `:${import.meta.env.DEV_PHOENIX_PORT}` : ''
    }`
  : `${import.meta.env.PROD_PHOENIX_HOST}${
      `${import.meta.env.PROD_PHOENIX_PORT}`.trim() ? `:${import.meta.env.PROD_PHOENIX_PORT}` : ''
    }`
export const SDSCLIENT_URL = `ws${
  PHOENIX_URL.startsWith('https') ? 's' : ''
}://${PHOENIX_URL.replace(/^https?:\/\//, '')}${import.meta.env.PHX_WS_PATH}`
