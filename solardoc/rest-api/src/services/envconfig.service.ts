import {injectable, /* inject, */ BindingScope} from '@loopback/core';
import * as dotenv from "dotenv";

let envLoaded = false;
let envConfig: dotenv.DotenvParseOutput = {};

/**
 * This function is used to ensure that the environment variables are loaded.
 *
 * It simply checks if the environment variables have been loaded, and if not
 * calls the `loadEnv()` function.
 * @since 0.2.0
 */
export function ensureEnvLoaded(): void {
  if (!envLoaded) {
    loadEnv();
  }
}

/**
 * This function is used to load the environment variables from the .env file.
 *
 * It is automatically called before any application is started, and will throw
 * an error if the .env file is missing or invalid.
 * @since 0.2.0
 */
export function loadEnv(): void {
  // First load the work dir .env file
  const result = dotenv.config();
  const { parsed } = result;

  // Then load the monorepo root .env file
  const rootResult = dotenv.config({ path: "../../.env" });
  const { parsed: rootParsed } = rootResult;

  if (
    result.error || !parsed || Object.keys(parsed).length === 0
    || rootResult.error || !rootParsed || Object.keys(rootParsed).length === 0
  ) {
    throw new Error(
      `[CRITICAL] Failed to load environment variables from work dir .env file or monorepo root .env file.
Please make sure that the .env files exist and are valid, as without the proper configuration the application can
not connect to the required databases and other services.

If the .env files exist, please make sure to check the following:
- The .env file exist in the monorepo root directory of the project or in the work dir (same directory as package.json)
- The .env file is valid, and all required variables are set (see .env.example)
- The .env file is readable by the user running the application (check file permissions)

${result.error?.stack ? result.error?.stack : "Error details: " + (result.error ? result.error?.message : "Empty .env file.")}`
    );
  }

  envLoaded = true;
  envConfig = Object.seal(
    Object.assign({}, parsed, rootParsed)
  );
}

/**
 * This function is used to retrieve an environment variable from the loaded .env file.
 *
 * [WARNING]
 * This function is intended for pre-runtime use only. If you need to access environment variables at runtime, please
 * use the `EnvConfigService` instead.
 * @param key The name of the environment variable to retrieve.
 * @param throwIfUndef Whether or not to throw an error if the environment variable is not defined. Defaults to true.
 * @since 0.2.0
 */
export function getEnv(key: string, throwIfUndef: boolean = true): string {
if (!envLoaded) {
    throw new Error(
      `[CRITICAL] Attempted to access environment variables before they were loaded.`
    );
  }

  const value = envConfig[key];
  if (throwIfUndef && !value) {
    throw new Error(
      `[CRITICAL] Attempted to access undefined environment variable "${key}" (Marked as required by application).`
    );
  }
  return value;
}

@injectable({scope: BindingScope.TRANSIENT})
export class EnvConfigService {
  constructor(/* Add @inject to inject parameters */) {
    if (!envLoaded) {
      throw new Error(
        `[CRITICAL] Attempted to access environment variables before they were loaded.`
      );
    }
  }

  /**
   * Returns the raw loaded environment variables.
   * @since 0.2.0
   */
  public get raw(): dotenv.DotenvParseOutput {
    return envConfig;
  }
}
