import { defineStore } from 'pinia'
import type { UserPrivate, UserToken } from '@/services/phoenix/gen/phoenix-rest-service'
import * as phoenixRestService from '@/services/phoenix/api-service'
import constants from '@/plugins/constants'
import { PhoenixInternalError, PhoenixRestError } from '@/services/phoenix/errors'

export type ServerAuthStatus = 'authenticated' | 'expired-or-revoked' | 'unreachable' | 'unknown'

export const useCurrentUserStore = defineStore('currentUser', {
  state: () => {
    let currentUser: UserPrivate | null
    try {
      currentUser = JSON.parse(localStorage.getItem(constants.localStorageCurrUserKey) as string)
    } catch (e) {
      currentUser = null
      localStorage.removeItem(constants.localStorageCurrUserKey)
    }

    let currentAuth: UserToken | null
    try {
      currentAuth = JSON.parse(localStorage.getItem(constants.localStorageAuthKey) as string)
    } catch (e) {
      currentAuth = null
      localStorage.removeItem(constants.localStorageCurrUserKey)
    }

    return {
      currentUser: currentUser as UserPrivate | null,
      currentAuth: currentAuth as UserToken | null,
    }
  },
  getters: {
    /**
     * Returns true if the user is based on the currently stored token logged in and the token is not expired.
     *
     * This does NOT make any assumptions whether the user is authorized to perform certain actions or whether the
     * server has itself not revoked the token. It only checks if the token is missing or expired.
     * @since 0.4.0
     */
    loggedIn(): boolean {
      return (
        this.currentUser !== null &&
        this.currentAuth !== null &&
        this.currentUser !== undefined &&
        this.currentAuth !== undefined &&
        Number(new Date()) < this.currentAuth.expires_at
      ) // Check if token is expired
    },
  },
  actions: {
    /**
     * Fetches the current user if it is not already fetched.
     * @since 0.4.0
     */
    async fetchCurrentUserIfNotFetchedAndAuthValid() {
      if (!this.currentUser) {
        await this.fetchCurrentUser()
      }
    },
    /**
     * Ensures that the current user is authenticated and that the token is not expired or revoked.
     * @returns Return one of the following:
     * - 'authenticated' if the user is authenticated and the token is not expired or revoked.
     * - 'expired-or-revoked' if the user is authenticated but the token is expired or revoked.
     * - 'unreachable' if the server is unreachable.
     * - 'unknown' if the status is unknown. No guarantees can be made about the user's authentication status.
     * @since 0.4.0
     */
    async ensureAuthNotExpiredOrRevoked(): Promise<ServerAuthStatus> {
      try {
        await this.fetchCurrentUser()
        return 'authenticated'
      } catch (e) {
        if (e instanceof PhoenixRestError) {
          if (e.errorCode === 401) {
            this.unsetCurrentUser()
            this.unsetCurrentAuth()
            return 'expired-or-revoked'
          }
        } else if (e instanceof PhoenixInternalError) {
          return 'unreachable'
        }
        return 'unknown'
      }
    },
    /**
     * Fetches the current user from the server.
     * @throws PhoenixInternalError If the request to fetch the current user fails critically.
     * @throws PhoenixRestError If the server rejects the request to fetch the current user.
     * @since 0.4.0
     */
    async fetchCurrentUser() {
      if (!this.currentAuth) {
        return
      }
      let resp: Awaited<ReturnType<typeof phoenixRestService.getV1UsersCurrent>>
      try {
        resp = await phoenixRestService.getV1UsersCurrent(`Bearer ${this.currentAuth.token}`)
      } catch (e) {
        throw new PhoenixInternalError(
          'Critically failed to fetch current user. Cause: ' + (<Error>e).message,
        )
      }
      if (resp.status === 200) {
        this.setCurrentUser(resp.data)
      } else if (resp.status === 401) {
        this.unsetCurrentUser()
        this.unsetCurrentAuth()
        throw new PhoenixRestError(
          'Server rejected request to fetch current user. Cause: Unauthorized',
          resp.status,
        )
      }
    },
    /**
     * Logs out the current user by revoking the token.
     * @throws PhoenixInternalError If the request to logout fails critically.
     * @throws PhoenixRestError If the server rejects the request to logout.
     * @since 0.4.0
     */
    async logout() {
      if (!this.currentAuth || !this.currentUser) {
        this.clean()
        return
      }
      let resp: Awaited<ReturnType<typeof phoenixRestService.deleteV1UsersAuth>>
      try {
        resp = await phoenixRestService.deleteV1UsersAuth(`Bearer ${this.currentAuth.token}`)
      } catch (e) {
        throw new PhoenixInternalError('Critically failed to logout. Cause: ' + (<Error>e).message)
      }
      if (resp.status === 200) {
        this.clean()
      } else if (resp.status === 400) {
        this.clean()
        throw new PhoenixRestError(
          'Server rejected request to logout. Cause: Bad request',
          resp.status,
        )
      } else if (resp.status === 401) {
        this.clean()
        throw new PhoenixRestError(
          'Server rejected request to logout. Cause: Unauthorized',
          resp.status,
        )
      }
    },
    setCurrentUser(currentUser: UserPrivate) {
      this.currentUser = currentUser
      localStorage.setItem(constants.localStorageCurrUserKey, JSON.stringify(currentUser))
    },
    unsetCurrentUser() {
      this.currentUser = null
      localStorage.removeItem(constants.localStorageCurrUserKey)
    },
    setCurrentAuth(currentAuth: UserToken) {
      this.currentAuth = currentAuth
      localStorage.setItem(constants.localStorageAuthKey, JSON.stringify(currentAuth))
    },
    unsetCurrentAuth() {
      this.currentAuth = null
      localStorage.removeItem(constants.localStorageAuthKey)
    },
    clean() {
      this.currentUser = null
      this.currentAuth = null
      localStorage.removeItem(constants.localStorageCurrUserKey)
      localStorage.removeItem(constants.localStorageAuthKey)
    },
  },
})
