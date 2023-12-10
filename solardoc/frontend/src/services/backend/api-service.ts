import * as api from "./gen/backend-rest-service"
import {getEnv, isDev} from "@/services/env";

// Overwrite the default configuration depending on the environment
api.defaults.baseUrl = isDev ?
  `${getEnv("VITE_DEV_BACKEND_HOST")}:${getEnv("VITE_DEV_BACKEND_PORT")}` // Development Default
  : `${getEnv("VITE_PROD_BACKEND_HOST")}:${getEnv("VITE_PROD_BACKEND_PORT")}` // Production Default

// Log the base URL in case there is a problem
console.log(`[api-service.ts] Using backend at '${api.defaults.baseUrl}'`)

export * from "./gen/backend-rest-service"
