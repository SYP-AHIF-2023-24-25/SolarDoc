import * as api from './gen/phoenix-rest-service'
import { isDev } from '@/config/env'

// Overwrite the default configuration depending on the environment
api.defaults.baseUrl = isDev
  ? `${import.meta.env.DEV_PHOENIX_HOST}${`${import.meta.env.DEV_PHOENIX_PORT}`.trim() ? `:${import.meta.env.DEV_PHOENIX_PORT}` : ""}`
  : `${import.meta.env.PROD_PHOENIX_HOST}${`${import.meta.env.PROD_PHOENIX_PORT}`.trim() ? `:${import.meta.env.PROD_PHOENIX_PORT}` : ""}`;
api.defaults.baseUrl += `${import.meta.env.API_BASE_PATH}`.trim() ?? '/api'

// Ensure to add the protocol to the base URL (if not already present)
// If HTTPS is needed, it should be set in the environment variables
if (!api.defaults.baseUrl.startsWith('http')) {
  api.defaults.baseUrl = `http://${api.defaults.baseUrl}`
}

// Log the base URL in case there is a problem
console.log(`[phoenix/api-service.ts] Using phoenix backend at '${api.defaults.baseUrl}'`)

// Export all the generated API functions
export * from './gen/phoenix-rest-service'
