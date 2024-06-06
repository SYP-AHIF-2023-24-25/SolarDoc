import type { UserPrivate, UserToken } from '@/services/phoenix/gen/phoenix-rest-service'
import {
  type ActualPhxErrorResp,
  PhoenixBadRequestError,
  PhoenixInternalError,
  PhoenixInvalidCredentialsError,
  PhoenixRestError,
} from '@/services/phoenix/errors'
import * as phoenixRestService from '@/services/phoenix/api-service'
import constants from '@/plugins/constants'
import { defineStore } from 'pinia'

export type ServerAuthStatus = 'authenticated' | 'expired-or-revoked' | 'unreachable' | 'unknown'

export const useCurrentUserStore = defineStore('currentUser', {
  state: () => {
    let currentUser: UserPrivate | undefined
    try {
      currentUser = JSON.parse(localStorage.getItem(constants.localStorageCurrUserKey) as string)
    } catch (e) {
      currentUser = undefined
      localStorage.removeItem(constants.localStorageCurrUserKey)
    }

    let currentAuth: UserToken | undefined
    try {
      currentAuth = JSON.parse(localStorage.getItem(constants.localStorageAuthKey) as string)
    } catch (e) {
      currentAuth = undefined
      localStorage.removeItem(constants.localStorageCurrUserKey)
    }

    return {
      currentUser: <UserPrivate | undefined>currentUser || undefined,
      currentAuth: <UserToken | undefined>currentAuth || undefined,
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
        this.currentUser !== undefined &&
        this.currentAuth !== undefined &&
        Number(new Date()) < this.currentAuth.expires_at
      ) // Check if token is expired
    },
    bearer(): string | undefined {
      return this.currentAuth ? `Bearer ${this.currentAuth.token}` : undefined
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
        resp = await phoenixRestService.getV1UsersCurrent(this.bearer || '')
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
        throw new PhoenixInvalidCredentialsError()
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
      let resp: Awaited<ReturnType<typeof phoenixRestService.deleteV1AuthBearer>>
      try {
        resp = await phoenixRestService.deleteV1AuthBearer(`Bearer ${this.currentAuth.token}`)
      } catch (e) {
        throw new PhoenixInternalError('Critically failed to logout. Cause: ' + (<Error>e).message)
      }
      this.clean()
      if (resp.status === 400) {
        throw new PhoenixBadRequestError(
          'Server rejected request to logout',
          resp.data as ActualPhxErrorResp,
        )
      } else if (resp.status === 401) {
        throw new PhoenixInvalidCredentialsError(
          'Server rejected request to logout',
          'Your saved token is invalid or has already been revoked. Please log in again.',
        )
      }
    },
    setCurrentUser(currentUser: UserPrivate) {
      this.currentUser = currentUser
      localStorage.setItem(constants.localStorageCurrUserKey, JSON.stringify(currentUser))
    },
    unsetCurrentUser() {
      this.currentUser = undefined
      localStorage.removeItem(constants.localStorageCurrUserKey)
    },
    setCurrentAuth(currentAuth: UserToken) {
      this.currentAuth = currentAuth
      localStorage.setItem(constants.localStorageAuthKey, JSON.stringify(currentAuth))
    },
    unsetCurrentAuth() {
      this.currentAuth = undefined
      localStorage.removeItem(constants.localStorageAuthKey)
    },
    /**
     * Forcefully clears the current user and auth token from the store and local storage.
     * @since 0.4.0
     */
    clean() {
      this.currentUser = undefined
      this.currentAuth = undefined
      localStorage.removeItem(constants.localStorageCurrUserKey)
      localStorage.removeItem(constants.localStorageAuthKey)
    },
  },
})
