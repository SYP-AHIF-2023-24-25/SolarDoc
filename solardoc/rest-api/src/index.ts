import { ApplicationConfig, RestApiApplication } from './application'
import { ensureEnvLoaded, getEnv } from './env'
import * as fs from 'fs/promises'

export * from './application'

// Ensure that the environment variables are loaded (only relevant for development mode, as in production mode the .env
// files are not used but rather global environment variables are used instead. This simplifies the deployment process
// using Docker.)
ensureEnvLoaded()

/**
 * The latest version of the API.
 *
 * This does not exclude the possibility of legacy versions being supported in their own independent legacy controllers.
 * @since 0.2.0
 */
export const API_VERSION = '1'

/**
 * The base path to the API, versioned. This includes the 'v' prefix.
 * @since 0.2.0
 */
export const API_PREFIXED_VERSION = `v${API_VERSION}`

/**
 * The base path to the API, not versioned.
 * @since 0.2.0
 */
export const API_BASE_PATH = getEnv('API_BASE_PATH', false) ?? '/api'

/**
 * The base path to the API, versioned.
 *
 * This points to the latest version of the API and is a root path.
 * @since 0.2.0
 */
export const API_VERSIONED_FULL_BASE_PATH = `/${API_BASE_PATH}/v${API_VERSION}`

/**
 * The path to the persistent storage directory.
 */
const persistentStoragePath: string = getEnv('PERSISTENT_STORAGE_PATH', true)!

/**
 * Ensures that the {@link persistentStoragePath} exists and is writable. If it does not exist, it will be created.
 * @since 0.2.0
 */
async function ensurePersistentStorageExists(): Promise<void> {
  try {
    await fs.access(persistentStoragePath, fs.constants.W_OK)
  } catch (e) {
    // If the directory does not exist, create it
    if ((<NodeJS.ErrnoException>e)?.code === 'ENOENT') {
      await fs.mkdir(persistentStoragePath, { recursive: true })
    } else {
      throw e
    }
  }
}

export async function main(options: ApplicationConfig = {}) {
  // First ensure the persistent storage exists
  await ensurePersistentStorageExists()

  // Then start the application
  const app = new RestApiApplication(options)

  // Set the base path for the API
  app.basePath(API_BASE_PATH)

  // Start the application
  await app.boot()
  await app.start()

  const url = app.restServer.url
  console.log(`Server is running at ${url}`)
  console.log(`Try ${url}/${API_PREFIXED_VERSION}/ping`)

  return app
}

if (require.main === module) {
  // Run the application
  const config = {
    rest: {
      port: +process.env.PORT! || 3000,
      host: process.env.HOST || '0.0.0.0',
      // The `gracePeriodForClose` provides a graceful close for http/https
      // servers with keep-alive clients. The default value is `Infinity`
      // (don't force-close). If you want to immediately destroy all sockets
      // upon stop, set its value to `0`.
      // See https://www.npmjs.com/package/stoppable
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        setServersFromRequest: true,
      },
    },
  }
  main(config).catch(err => {
    console.error(`Cannot start the application. \n\n${(<Error>err).stack ?? err}`)
    process.exit(1)
  })
}
