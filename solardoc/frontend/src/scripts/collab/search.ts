import * as phoenixRestService from "@/services/phoenix/api-service";

export type GlobalSearchQuery = Parameters<typeof phoenixRestService.getV2FilesGlobal>[1] & {}
