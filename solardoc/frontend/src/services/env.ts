// Check what type of environment we are running in
export const envType: 'development' | 'production' = import.meta.env.MODE === 'production' ?
  'production'
  : 'development'
export const isDev = envType === 'development'
export const isProd = envType === 'production'

/**
 * This function is used to retrieve an environment variable from the loaded .env file.
 * @param key The name of the environment variable to retrieve.
 * @param throwIfUndef Whether or not to throw an error if the environment variable is not defined. Defaults to true.
 * @since 0.2.0
 */
export function getEnv(key: string, throwIfUndef: boolean = true): string | undefined {
  const val = import.meta.env[key]
  if (throwIfUndef && val === undefined) {
    throw new Error(`Environment variable ${key} is not defined!`)
  }
  return val
}

console.log(`[env.ts] Running in '${envType}' mode`)
