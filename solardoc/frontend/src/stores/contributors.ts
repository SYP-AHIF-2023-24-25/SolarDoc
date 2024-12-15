import { defineStore } from 'pinia';
import { ref } from 'vue';
import { FilePermission } from '@/services/phoenix/gen/phoenix-rest-service';
import * as phoenixRestService from '@/services/phoenix/api-service';

export const useContributorsStore = defineStore('contributors', () => {
    const contributors = ref<Array<FilePermission>>([]);

    const setContributors = (newContributors: Array<FilePermission>) => {
        contributors.value = newContributors;
    };

    const fetchAndUpdateContributors = async (bearerToken: string, fileId: string) => {
        try {
            const resp = await phoenixRestService.getV2FilesByFileIdPermissions(bearerToken, fileId);

            if (resp.status === 200) {
                setContributors(resp.data);
            } else {
                console.error('Failed to fetch contributors:', resp.status);
            }
        } catch (e) {
            console.error('Error fetching contributors:', e);
        }
    };

    return {
        contributors,
        setContributors,
        fetchAndUpdateContributors,
    };
});
