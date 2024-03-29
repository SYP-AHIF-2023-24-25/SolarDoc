/**
 * @solardoc/phoenix
 * 0.4.0
 * DO NOT MODIFY - This file has been generated using oazapfts.
 * See https://www.npmjs.com/package/oazapfts
 */
import * as Oazapfts from 'oazapfts/lib/runtime'
import * as QS from 'oazapfts/lib/runtime/query'
export const defaults: Oazapfts.RequestOpts = {
  baseUrl: 'http://localhost:4000/api',
}
const oazapfts = Oazapfts.runtime(defaults)
export const servers = {
  server1: 'http://localhost:4000/api',
  server2: 'https://localhost:4000/api',
  server3: 'ws://localhost:4000/api',
  server4: 'wss://localhost:4000/api',
}
export type Message = {
  message: string
}
export type Error = {
  detail: string
}
export type Errors = Error[]
export type UserLogin = {
  email: string
  password: string
}
export type UserToken = {
  expires_at: number
  token: string
}
export type UserTrusted = {
  id: string
  username: string
}
export type EditorChannel = {
  active_since: number
  creator: UserTrusted
  description: string
  id: string
  name: string
}
export type EditorChannels = EditorChannel[]
export type Ping = {
  date: number
  greeting: string
  ip: string
  url: string
}
export type UserPublic = {
  id: string
}
export type UsersPublic = UserPublic[]
export type CreateUser = {
  email: string
  intended_use?: number
  organisation?: string
  password: string
  role?: string
  username?: string
}
export type UserPrivate = {
  confirmed_at?: string
  email: string
  id: string
  intended_use?: number
  organisation?: string
  role?: string
  username?: string
}
/**
 * Log out a user
 */
export function deleteV1AuthBearer(authorization: string, opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<
    | {
        status: 200
        data: Message
      }
    | {
        status: 400
        data: Errors
      }
    | {
        status: 401
        data: Errors
      }
  >('/v1/auth/bearer', {
    ...opts,
    method: 'DELETE',
    headers: {
      ...(opts && opts.headers),
      Authorization: authorization,
    },
  })
}
/**
 * Log in a user
 */
export function postV1AuthBearer(userLogin?: UserLogin, opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<
    | {
        status: 200
        data: UserToken
      }
    | {
        status: 400
        data: Errors
      }
    | {
        status: 401
        data: Errors
      }
  >(
    '/v1/auth/bearer',
    oazapfts.json({
      ...opts,
      method: 'POST',
      body: userLogin,
    }),
  )
}
/**
 * List all currently running editor channels
 */
export function getV1EditorChannels(authorization: string, opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<
    | {
        status: 200
        data: EditorChannels
      }
    | {
        status: 401
        data: Errors
      }
  >('/v1/editor_channels', {
    ...opts,
    headers: {
      ...(opts && opts.headers),
      Authorization: authorization,
    },
  })
}
/**
 * Get a single editor channel
 */
export function getV1EditorChannelsId(
  authorization: string,
  id: number,
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.fetchJson<
    | {
        status: 200
        data: EditorChannel
      }
    | {
        status: 401
        data: Errors
      }
  >('/v1/editor_channels/:id', {
    ...opts,
    headers: {
      ...(opts && opts.headers),
      Authorization: authorization,
    },
  })
}
/**
 * Ping the server
 */
export function getV1Ping(opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<{
    status: 200
    data: Ping
  }>('/v1/ping', {
    ...opts,
  })
}
/**
 * List all users
 */
export function getV1Users(opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<{
    status: 200
    data: UsersPublic
  }>('/v1/users', {
    ...opts,
  })
}
/**
 * Create a new user
 */
export function postV1Users(createUser?: CreateUser, opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<
    | {
        status: 201
        data: UserPrivate
      }
    | {
        status: 400
        data: Errors
      }
  >(
    '/v1/users',
    oazapfts.json({
      ...opts,
      method: 'POST',
      body: createUser,
    }),
  )
}
/**
 * Get the current user
 */
export function getV1UsersCurrent(authorization: string, opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<
    | {
        status: 200
        data: UserPrivate
      }
    | {
        status: 401
        data: Errors
      }
  >('/v1/users/current', {
    ...opts,
    headers: {
      ...(opts && opts.headers),
      Authorization: authorization,
    },
  })
}
