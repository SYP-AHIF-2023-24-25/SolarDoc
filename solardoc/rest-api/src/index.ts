import { ApplicationConfig, RestApiApplication } from './application'
import {ensureEnvLoaded, getEnv} from './env'
import * as fs from "fs/promises";
import * as path from "path";

export * from './application'

// Ensure that the environment variables are loaded (only relevant for development mode, as in production mode the .env
// files are not used but rather global environment variables are used instead. This simplifies the deployment process
// using Docker.)
ensureEnvLoaded()

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
  await app.boot()
  await app.start()

  const url = app.restServer.url
  console.log(`Server is running at ${url}`)
  console.log(`Try ${url}/ping`)

  return app
}

if (require.main === module) {
  // Run the application
  const config = {
    rest: {
      port: +(process.env.PORT ?? 3000),
      host: process.env.HOST,
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
    console.error(`Cannot start the application. \n\n${err}`)
    process.exit(1)
  })
}
