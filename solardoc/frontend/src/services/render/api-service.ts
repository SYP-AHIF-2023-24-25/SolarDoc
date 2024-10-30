import * as api from './gen/backend-rest-service'
import { isDev } from '@/config/env'
import { SolardocUnreachableError } from '@/errors/unreachable-error'

// Overwrite the default configuration depending on the environment
api.defaults.baseUrl = isDev
  ? `${import.meta.env.DEV_BACKEND_HOST}${
      `${import.meta.env.DEV_BACKEND_PORT}`.trim() ? `:${import.meta.env.DEV_BACKEND_PORT}` : ''
    }` // Development Default
  : `${import.meta.env.PROD_BACKEND_HOST}${
      `${import.meta.env.PROD_BACKEND_PORT}`.trim() ? `:${import.meta.env.PROD_BACKEND_PORT}` : ''
    }` // Production Default
api.defaults.baseUrl += `${import.meta.env.API_BASE_PATH}`.trim() ?? '/api'

// Ensure to add the protocol to the base URL (if not already present)
// If HTTPS is needed, it should be set in the environment variables
if (!api.defaults.baseUrl.startsWith('http')) {
  api.defaults.baseUrl = `http://${api.defaults.baseUrl}`
}

// Log the base URL in case there is a problem
console.log(`[backend/api-service.ts] Using render backend at '${api.defaults.baseUrl}'`)

export async function ensureRenderBackendIsReachable(): Promise<void> {
  let ping: Awaited<ReturnType<typeof api.getV2Ping>> | undefined = undefined
  try {
    ping = await api.getV2Ping()
  } catch (_ignore) {
    /* empty */
  }
  if (!ping || ping.status !== 200) {
    throw new SolardocUnreachableError('Render Backend is not reachable')
  }
}

// Export all the generated API functions
export * from './gen/backend-rest-service'
