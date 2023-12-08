import {InvalidEnvError} from "../errors/invalid-env-error";

/**
 * The browser environment constant name.
 * @since 0.2.0
 */
export type Browser = "browser";

/**
 * The browser environment constant name.
 * @since 0.2.0
 */
export const BROWSER: Browser = "browser";

/**
 * The node environment constant name.
 * @since 0.2.0
 */
export type Node = "node";

/**
 * The node environment constant name.
 * @since 0.2.0
 */
export const NODE: Node = "node";

/**
 * Union of all compatible environment constant names.
 * @since 0.2.0
 */
export type CompatibleEnv = Browser | Node;

/**
 * List of all compatible environment constant names.
 * @since 0.2.0
 */
export const COMPATIBLE_ENVS: [Browser, Node] = [BROWSER, NODE];

/**
 * Determines if the given code is running in a browser or node environment.
 *
 * This will ensure all required globals for each environment are provided, and will
 * throw an error in case that the environment is not supported (e.g. Deno).
 * @returns The environment name.
 * @throws InvalidEnvError If the environment is not supported.
 * @since 0.2.0
 */
export function detEnv(): CompatibleEnv {
  // @ts-ignore
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    return "browser";
  // @ts-ignore
  } else if (typeof process !== "undefined" && process.versions != null && process.versions.node != null) {
    return "node";
  }
  throw new InvalidEnvError("Unsupported environment!");
}
