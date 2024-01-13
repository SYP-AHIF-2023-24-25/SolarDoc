import * as api from './gen/backend-rest-service'
import { isDev } from '@/config/env'

// Overwrite the default configuration depending on the environment
api.defaults.baseUrl = isDev
  ? `${import.meta.env.DEV_BACKEND_HOST}:${import.meta.env.DEV_BACKEND_PORT}` // Development Default
  : `${import.meta.env.PROD_BACKEND_HOST}:${import.meta.env.PROD_BACKEND_PORT}` // Production Default
api.defaults.baseUrl += '/api' // Append the API prefix (always present)

// Log the base URL in case there is a problem
console.log(`[api-service.ts] Using backend at '${api.defaults.baseUrl}'`)

export async function checkIfBackendIsReachable(): Promise<void> {
  const ping = await api.getV1Ping()
  if (ping.status !== 200) {
    throw new Error(`Backend is not reachable. Response:\n${ping}`)
  }
}

// Export all the generated API functions
export * from './gen/backend-rest-service'
