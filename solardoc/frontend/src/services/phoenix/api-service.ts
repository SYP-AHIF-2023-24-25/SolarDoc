import * as api from './gen/phoenix-rest-service'
import {PHOENIX_URL} from "./config";

// Overwrite the default configuration depending on the environment
api.defaults.baseUrl = PHOENIX_URL;
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
