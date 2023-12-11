/**
 * Version 1 of the API.
 * @since 0.2.0
 */
import { API_BASE_PATH } from '../../index'

/**
 * The version of this API folder/collection of controllers.
 * @since 0.2.0
 */
export const API_VERSION = '1'

/**
 * The base path to the API, versioned.
 *
 * This is relative to the {@link API_BASE_PATH}.
 */
export const API_PREFIXED_VERSION = `v${API_VERSION}`

/**
 * The base path to the API, versioned.
 *
 * This is unique to this folder/collection of controllers and is a root path.
 * @since 0.2.0
 */
export const API_VERSIONED_FULL_BASE_PATH = `/${API_BASE_PATH}/v${API_VERSION}`

export * from './ping.controller'
export * from './render.controller'
export * from './result.controller'
