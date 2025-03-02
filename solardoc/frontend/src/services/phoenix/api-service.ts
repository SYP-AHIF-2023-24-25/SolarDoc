import * as api from './gen/phoenix-rest-service'
import { PHOENIX_URL, SDSCLIENT_URL } from './config'
import { SolardocUnreachableError } from '@/errors/unreachable-error'

// Overwrite the default configuration depending on the environment
api.defaults.baseUrl = PHOENIX_URL
api.defaults.baseUrl += `${import.meta.env.PHX_BASE_PATH}`.trim() ?? '/api'

// Ensure to add the protocol to the base URL (if not already present)
// If HTTPS is needed, it should be set in the environment variables
if (!api.defaults.baseUrl.startsWith('http')) {
  api.defaults.baseUrl = `http://${api.defaults.baseUrl}`
}

// Log the base URL in case there is a problem
console.log(`[Phoenix] Using phoenix backend at '${api.defaults.baseUrl}'`)

// Log the WS URL in case there is a problem
console.log(`[Phoenix] Using SDS at '${SDSCLIENT_URL}'`)

export async function ensurePhoenixBackendIsReachable(): Promise<void> {
  let ping: Awaited<ReturnType<typeof api.getV2Ping>> | undefined = undefined
  try {
    ping = await api.getV2Ping()
  } catch (_ignore) {
    /* empty */
  }
  if (!ping || ping.status !== 200) {
    throw new SolardocUnreachableError(`Phoenix Backend is not reachable`)
  }
}

// Export all the generated API functions
export * from './gen/phoenix-rest-service'
