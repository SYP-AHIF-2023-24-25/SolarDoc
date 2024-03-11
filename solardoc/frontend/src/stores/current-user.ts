import {defineStore} from "pinia";
import type {UserPrivate, UserToken} from "@/services/phoenix/gen/phoenix-rest-service";
import * as phoenixRestService from "@/services/phoenix/api-service";
import constants from "@/plugins/constants";
import {PhoenixInternalError, PhoenixRestError} from "@/services/phoenix/errors";

export const useCurrentUserStore = defineStore('currentUser', {
  state: () => {
    let currentUser: UserPrivate | null;
    try {
      currentUser = JSON.parse(localStorage.getItem(constants.localStorageCurrUserKey) as string);
    } catch (e) {
      currentUser = null;
      localStorage.removeItem(constants.localStorageCurrUserKey);
    }

    let currentAuth: UserToken | null;
    try {
      currentAuth = JSON.parse(localStorage.getItem(constants.localStorageAuthKey) as string);
    } catch (e) {
      currentAuth = null;
      localStorage.removeItem(constants.localStorageCurrUserKey);
    }

    return {
      currentUser: currentUser as UserPrivate | null,
      currentAuth: currentAuth as UserToken | null,
    }
  },
  actions: {
    get loggedIn(): boolean {
      return !!this.currentAuth
        && !!this.currentUser
        && Number(new Date()) < this.currentAuth.expires_at // Check if token is expired
    },
    async fetchCurrentUserIfNotFetchedAndAuthValid() {
      if (!this.currentUser) {
        await this.fetchCurrentUser()
      }
    },
    async fetchCurrentUser() {
      if (!this.currentAuth) {
        return
      }
      let resp: Awaited<ReturnType<typeof phoenixRestService.getV1UsersCurrent>>
      try {
        resp = await phoenixRestService.getV1UsersCurrent(`Bearer ${this.currentAuth.token}`)
      } catch (e) {
        throw new PhoenixInternalError("Critically failed to fetch current user. Cause: " + ((<Error>e).message))
      }
      if (resp.status === 200) {
        this.setCurrentUser(resp.data)
      } else if (resp.status === 401) {
        this.unsetCurrentUser()
        this.unsetCurrentAuth()
        throw new PhoenixRestError("Server rejected request to fetch current user. Cause: Unauthorized", resp.status)
      }
    },
    async logout() {
      if (!this.currentAuth || !this.currentUser) {
        this.clean()
        return
      }
      let resp: Awaited<ReturnType<typeof phoenixRestService.deleteV1UsersAuth>>
      try {
        resp = await phoenixRestService.deleteV1UsersAuth(`Bearer ${this.currentAuth.token}`)
      } catch (e) {
        throw new PhoenixInternalError("Critically failed to logout. Cause: " + ((<Error>e).message))
      }
      if (resp.status === 200) {
        this.clean()
      } else if (resp.status === 400) {
        this.clean()
        throw new PhoenixRestError("Server rejected request to logout. Cause: Bad request", resp.status)
      } else if (resp.status === 401) {
        this.clean()
        throw new PhoenixRestError("Server rejected request to logout. Cause: Unauthorized", resp.status)
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
});
