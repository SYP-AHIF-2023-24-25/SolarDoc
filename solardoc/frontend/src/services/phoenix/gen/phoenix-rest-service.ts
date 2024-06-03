/**
 * @solardoc/phoenix
 * 0.7.0-dev
 * DO NOT MODIFY - This file has been generated using oazapfts.
 * See https://www.npmjs.com/package/oazapfts
 */
import * as Oazapfts from 'oazapfts/lib/runtime'
import * as QS from 'oazapfts/lib/runtime/query'
export const defaults: Oazapfts.RequestOpts = {
  baseUrl: 'http://localhost:4000/phx/api',
}
const oazapfts = Oazapfts.runtime(defaults)
export const servers = {
  server1: 'http://localhost:4000/phx/api',
  server2: 'https://localhost:4000/phx/api',
  server3: 'ws://localhost:4000/phx/api',
  server4: 'wss://localhost:4000/phx/api',
}
export type ErrorsResp = object
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
export type File = {
  content: string
  created: number
  file_name: string
  id: string
  last_edited: number
  owner_id: string
}
export type Files = File[]
export type CreateFile = {
  content?: string
  file_name: string
}
export type UpdateFile = {
  content?: string
  file_name?: string
}
export type Ping = {
  date: number
  greeting: string
  ip: string
  url: string
}
export type CreateShareUrl = {
  file_id: string
  perms: number
}
export type ShareUrl = {
  expired: boolean
  expires_at: number
  file_id: string
  id: string
  issued_at: number
  perms: number
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
        status: 204
      }
    | {
        status: 400
        data: ErrorsResp
      }
    | {
        status: 401
        data: ErrorsResp
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
export function postV1AuthBearer(userLogin: UserLogin, opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<
    | {
        status: 201
        data: UserToken
      }
    | {
        status: 400
        data: ErrorsResp
      }
    | {
        status: 401
        data: ErrorsResp
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
        data: ErrorsResp
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
export function getV1EditorChannelsById(
  authorization: string,
  id: string,
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.fetchJson<
    | {
        status: 200
        data: EditorChannel
      }
    | {
        status: 401
        data: ErrorsResp
      }
  >(`/v1/editor_channels/${encodeURIComponent(id)}`, {
    ...opts,
    headers: {
      ...(opts && opts.headers),
      Authorization: authorization,
    },
  })
}
/**
 * List all files owned by the current user
 */
export function getV1Files(authorization: string, opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<
    | {
        status: 200
        data: Files
      }
    | {
        status: 401
        data: ErrorsResp
      }
  >('/v1/files', {
    ...opts,
    headers: {
      ...(opts && opts.headers),
      Authorization: authorization,
    },
  })
}
/**
 * Create a new file
 */
export function postV1Files(
  authorization: string,
  createFile: CreateFile,
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.fetchJson<
    | {
        status: 201
        data: File
      }
    | {
        status: 400
        data: ErrorsResp
      }
    | {
        status: 401
        data: ErrorsResp
      }
  >(
    '/v1/files',
    oazapfts.json({
      ...opts,
      method: 'POST',
      body: createFile,
      headers: {
        ...(opts && opts.headers),
        Authorization: authorization,
      },
    }),
  )
}
/**
 * Deletes a file
 */
export function deleteV1FilesById(authorization: string, id: string, opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<
    | {
        status: 204
      }
    | {
        status: 400
        data: ErrorsResp
      }
    | {
        status: 401
        data: ErrorsResp
      }
    | {
        status: 404
        data: ErrorsResp
      }
  >(`/v1/files/${encodeURIComponent(id)}`, {
    ...opts,
    method: 'DELETE',
    headers: {
      ...(opts && opts.headers),
      Authorization: authorization,
    },
  })
}
/**
 * Get a single file
 */
export function getV1FilesById(authorization: string, id: string, opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<
    | {
        status: 200
        data: File
      }
    | {
        status: 401
        data: ErrorsResp
      }
    | {
        status: 404
        data: ErrorsResp
      }
  >(`/v1/files/${encodeURIComponent(id)}`, {
    ...opts,
    headers: {
      ...(opts && opts.headers),
      Authorization: authorization,
    },
  })
}
/**
 * Update a single file
 */
export function putV1FilesById(
  authorization: string,
  id: string,
  updateFile: UpdateFile,
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.fetchJson<
    | {
        status: 200
        data: File
      }
    | {
        status: 400
        data: ErrorsResp
      }
    | {
        status: 401
        data: ErrorsResp
      }
    | {
        status: 404
        data: ErrorsResp
      }
  >(
    `/v1/files/${encodeURIComponent(id)}`,
    oazapfts.json({
      ...opts,
      method: 'PUT',
      body: updateFile,
      headers: {
        ...(opts && opts.headers),
        Authorization: authorization,
      },
    }),
  )
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
 * Create a new share url
 */
export function postV1Share(
  authorization: string,
  createShareUrl: CreateShareUrl,
  opts?: Oazapfts.RequestOpts,
) {
  return oazapfts.fetchJson<
    | {
        status: 201
        data: ShareUrl
      }
    | {
        status: 400
        data: ErrorsResp
      }
    | {
        status: 401
        data: ErrorsResp
      }
  >(
    '/v1/share',
    oazapfts.json({
      ...opts,
      method: 'POST',
      body: createShareUrl,
      headers: {
        ...(opts && opts.headers),
        Authorization: authorization,
      },
    }),
  )
}
/**
 * Get a single share url
 */
export function getV1ShareById(authorization: string, id: string, opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<
    | {
        status: 200
        data: ShareUrl
      }
    | {
        status: 401
        data: ErrorsResp
      }
  >(`/v1/share/${encodeURIComponent(id)}`, {
    ...opts,
    headers: {
      ...(opts && opts.headers),
      Authorization: authorization,
    },
  })
}
/**
 * Get a file via a share url
 */
export function getV1ShareByIdFile(authorization: string, id: string, opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<
    | {
        status: 200
        data: File
      }
    | {
        status: 401
        data: ErrorsResp
      }
  >(`/v1/share/${encodeURIComponent(id)}/file`, {
    ...opts,
    headers: {
      ...(opts && opts.headers),
      Authorization: authorization,
    },
  })
}
/**
 * List all users
 */
export function getV1Users(authorization: string, opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<{
    status: 200
    data: UsersPublic
  }>('/v1/users', {
    ...opts,
    headers: {
      ...(opts && opts.headers),
      Authorization: authorization,
    },
  })
}
/**
 * Create a new user
 */
export function postV1Users(createUser: CreateUser, opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<
    | {
        status: 201
        data: UserPrivate
      }
    | {
        status: 400
        data: ErrorsResp
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
        data: ErrorsResp
      }
  >('/v1/users/current', {
    ...opts,
    headers: {
      ...(opts && opts.headers),
      Authorization: authorization,
    },
  })
}
