import * as dotenv from 'dotenv'

// Check what type of environment we are running in
export const envType: 'development' | 'production' =
  process.env.NODE_ENV === 'production' ? 'production' : 'development'
export const isDev = envType === 'development'
export const isProd = envType === 'production'

// State variables
let envLoaded: boolean = false
let envConfig: dotenv.DotenvParseOutput = {}

/**
 * This function is used to ensure that the environment variables are loaded. (Only in development mode, as in
 * production mode the .env files are not used but rather global environment variables are used instead. This simplifies
 * the deployment process using Docker.)
 *
 * This function simply checks if {@link isDev} is true and if .env have been loaded, and if not calls the `loadEnv()`
 * function.
 * @since 0.2.0
 */
export function ensureEnvLoaded(): void {
  if (!envLoaded && isDev) {
    loadEnvDev()
  }
}

/**
 * This function is used to load the environment variables from the .env file.
 *
 * It is automatically called before any application is started, and will throw
 * an error if the .env file is missing or invalid.
 * @since 0.2.0
 */
export function loadEnvDev(): void {
  // First load the work dir .env file
  const localResult = dotenv.config()
  const { parsed: localParsed } = localResult

  // Then load the monorepo root .env file
  const rootResult = dotenv.config({ path: '../../.env' })
  const { parsed: rootParsed } = rootResult

  // Merge the two .env files
  const mergedParsedEnvOptions = Object.assign({}, localParsed, rootParsed)

  if (
    localResult.error !== undefined ||
    rootResult.error !== undefined ||
    !mergedParsedEnvOptions ||
    Object.keys(mergedParsedEnvOptions).length === 0
  ) {
    throw new Error(
      `[CRITICAL] Failed to load environment variables from work dir .env file or monorepo root .env file.
Please make sure that the .env files exist and are valid, as without the proper configuration the application can
not connect to the required databases and other services.

If the .env files exist, please make sure to check the following:
- The .env file exist in the monorepo root directory of the project or in the work dir (same directory as package.json)
- The .env file is valid, and all required variables are set (see .env.example)
- The .env file is readable by the user running the application (check file permissions)

${
  localResult.error?.stack
    ? localResult.error?.stack
    : 'Error details: ' + (localResult.error ? localResult.error?.message : 'Empty .env file.')
}`,
    )
  }

  envLoaded = true
  envConfig = Object.seal(Object.assign({}, mergedParsedEnvOptions, rootParsed))
}

/**
 * This function is used to retrieve an environment variable from the loaded .env file.
 * @param key The name of the environment variable to retrieve.
 * @param throwIfUndef Whether or not to throw an error if the environment variable is not defined. Defaults to true.
 * @since 0.2.0
 */
export function getEnv(key: string, throwIfUndef: boolean = true): string | undefined {
  if (!envLoaded && isDev) {
    throw new Error(`[CRITICAL] Attempted to access environment variables before they were loaded.`)
  }

  if (isDev) {
    const value: string | undefined = envConfig[key]
    if (throwIfUndef && !value) {
      throw new Error(
        `[CRITICAL] Attempted to access undefined environment variable "${key}" (Marked as required by application).`,
      )
    }
    return value
  } else {
    const val: string | undefined = process.env[key]
    if (throwIfUndef && !val) {
      throw new Error(
        `[CRITICAL] Attempted to access undefined environment variable "${key}" (Marked as required by application).`,
      )
    }
    return val
  }
}

/**
 * Staging is a deployment state between development and production. This means it's deployed inside Docker but not
 * publicly exposed using HTTPS.
 * @since 0.4.0
 */
export const isStaging = getEnv('STAGING', false) === 'staging'
