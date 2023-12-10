/**
 * @solardoc/rest-api
 * 0.1.0
 * DO NOT MODIFY - This file has been generated using oazapfts.
 * See https://www.npmjs.com/package/oazapfts
 */
import * as Oazapfts from "oazapfts/lib/runtime";
import * as QS from "oazapfts/lib/runtime/query";
export const defaults: Oazapfts.RequestOpts = {
    baseUrl: "/",
};
const oazapfts = Oazapfts.runtime(defaults);
export const servers = {
    server1: "/"
};
export type PingResponse = {
    greeting?: string;
    date?: string;
    url?: string;
    headers?: {
        "Content-Type"?: string;
        [key: string]: any;
    };
};
export function getPing(opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 200;
        data: PingResponse;
    }>("/ping", {
        ...opts
    });
}
