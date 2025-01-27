import { defineStore } from 'pinia'
import type { UserPublic } from '@/services/phoenix/api-service'
import * as phoenixRestService from '@/services/phoenix/api-service'
import type { Awaited } from '@vueuse/core'
import {
  PhoenixInternalError,
  PhoenixInvalidCredentialsError,
  PhoenixNotFoundError,
} from '@/services/phoenix/errors'

export const useFileOwnerStore = defineStore('fileOwner', {
  state: () => {
    return {
      owner: <UserPublic | undefined>undefined,
    }
  },
  actions: {
    async fetchAndUpdateFileOwner(bearerToken: string, userId: string) {
      let resp: Awaited<ReturnType<typeof phoenixRestService.getV2UsersById>>
      try {
        resp = await phoenixRestService.getV2UsersById(bearerToken, userId)
      } catch (e) {
        throw new PhoenixInternalError(
          'Critically failed to fetch owner of the file. Cause: ' + (<Error>e).message,
        )
      }
      if (resp.status === 200) {
        this.owner = resp.data satisfies UserPublic
      } else if (resp.status === 401) {
        throw new PhoenixInvalidCredentialsError(
          'Server rejected request to load file owner',
          'Your saved token is invalid or has already been revoked. Please log in again.',
        )
      } else if (resp.status === 404) {
        throw new PhoenixNotFoundError(
          'Server rejected request to load file owner',
          'The user does not exist.',
        )
      }
    },
  },
})
