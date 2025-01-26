import { defineStore } from 'pinia'
import * as phoenixRestService from '@/services/phoenix/api-service'
import type { FilePermission } from '@/services/phoenix/api-service'

export const useContributorsStore = defineStore('contributors', {
  state: () => {
    return {
      contributors: [] as Array<FilePermission>,
    }
  },
  actions: {
    async fetchAndUpdateContributors(bearerToken: string, fileId: string) {
      try {
        const resp = await phoenixRestService.getV2FilesByFileIdPermissions(bearerToken, fileId)
        if (resp.status === 200) {
          this.contributors = resp.data
        } else {
          console.error('Failed to fetch contributors:', resp.status)
        }
      } catch (e) {
        console.error('Error fetching contributors:', e)
      }
    },
  },
})
