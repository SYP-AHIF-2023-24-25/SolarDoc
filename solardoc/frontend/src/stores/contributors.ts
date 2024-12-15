import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { FilePermission } from '@/services/phoenix/gen/phoenix-rest-service';
import * as phoenixRestService from '@/services/phoenix/api-service';

export const useContributorsStore = defineStore('contributors', () => {
    const contributors = ref<Array<FilePermission>>([]);

    const getContributorsCount = () => contributors.value.length;

    const fetchAndUpdateContributors = async (bearerToken: string, fileId: string) => {
        try {
            const resp = await phoenixRestService.getV2FilesByFileIdPermissions(bearerToken, fileId);

            if (resp.status === 200) {
                contributors.value = resp.data;
            } else {
                console.error('Failed to fetch contributors:', resp.status);
            }
        } catch (e) {
            console.error('Error fetching contributors:', e);
        }
    };

    return {
        contributors,
        getContributorsCount,
        fetchAndUpdateContributors
    };
});
