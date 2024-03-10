import {defineStore} from "pinia";
import type {UserPrivate, UserToken} from "@/services/phoenix/gen/phoenix-rest-service";
import * as phoenixRestService from "@/services/phoenix/api-service";
import constants from "@/plugins/constants";

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
    async fetchCurrentUser() {
      if (!this.currentAuth) {
        return
      }
      try {
        const resp = await phoenixRestService.getV1UsersCurrent(`Bearer ${this.currentAuth.token}`)
        if (resp.status === 200) {
          this.setCurrentUser(resp.data)
        } else if (resp.status === 401) {
          this.unsetCurrentUser()
          this.unsetCurrentAuth()
          throw new Error("Server rejected request to fetch current user. Cause: Unauthorized")
        }
      } catch (e) {
        throw new Error("Server rejected request to fetch current user. Cause: " + ((<Error>e).message))
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
  },
});
