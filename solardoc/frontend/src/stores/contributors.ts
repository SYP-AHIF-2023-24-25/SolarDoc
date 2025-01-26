import { defineStore } from 'pinia'
import * as phoenixRestService from '@/services/phoenix/api-service'
import type { FilePermission } from '@/services/phoenix/api-service'
import {
  PhoenixBadRequestError,
  PhoenixInternalError,
  PhoenixInvalidCredentialsError,
  PhoenixNotFoundError,
} from '@/services/phoenix/errors'
import type { Awaited } from '@vueuse/core'

export const useContributorsStore = defineStore('contributors', {
  state: () => {
    return {
      contributors: [] as Array<FilePermission>,
    }
  },
  actions: {
    async fetchAndUpdateContributors(bearerToken: string, fileId: string) {
      let resp: Awaited<ReturnType<typeof phoenixRestService.getV2FilesByFileIdPermissions>>
      try {
        resp = await phoenixRestService.getV2FilesByFileIdPermissions(bearerToken, fileId)
      } catch (e) {
        throw new PhoenixInternalError(
          'Critically failed to fetch owner of the file. Cause: ' + (<Error>e).message,
        )
      }
      if (resp.status === 200) {
        this.contributors = resp.data
      } else if (resp.status === 400) {
        throw new PhoenixBadRequestError(
          'Server rejected request to load file owner',
          'Invalid request data. Please check your input and try again.',
        )
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
