/**
 * @solardoc/phoenix
 * 0.4.0-dev
 * DO NOT MODIFY - This file has been generated using oazapfts.
 * See https://www.npmjs.com/package/oazapfts
 */
import * as Oazapfts from "oazapfts/lib/runtime";
import * as QS from "oazapfts/lib/runtime/query";
export const defaults: Oazapfts.RequestOpts = {
    baseUrl: "http://localhost:4000/api",
};
const oazapfts = Oazapfts.runtime(defaults);
export const servers = {
    server1: "http://localhost:4000/api",
    server2: "https://localhost:4000/api",
    server3: "ws://localhost:4000/api",
    server4: "wss://localhost:4000/api"
};
export type UserPublic = {
    id: string;
};
export type UsersPublic = UserPublic[];
export type CreateUser = {
    email: string;
    password: string;
};
export type UserPrivate = {
    confirmed_at?: any;
    email: string;
    id: string;
    role: string;
};
export type UserLogin = {
    email: string;
    password: string;
};
export type UserToken = {
    token: string;
};
/**
 * List all users
 */
export function getV1Users(opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 200;
        data: UsersPublic;
    }>("/v1/users", {
        ...opts
    });
}
/**
 * Create a new user
 */
export function postV1Users(createUser?: CreateUser, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 201;
        data: UserPrivate;
    }>("/v1/users", oazapfts.json({
        ...opts,
        method: "POST",
        body: createUser
    }));
}
/**
 * Log out a user
 */
export function deleteV1UsersAuth(opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchText("/v1/users/auth", {
        ...opts,
        method: "DELETE"
    });
}
/**
 * Log in a user
 */
export function postV1UsersAuth(userLogin?: UserLogin, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 200;
        data: UserToken;
    }>("/v1/users/auth", oazapfts.json({
        ...opts,
        method: "POST",
        body: userLogin
    }));
}
/**
 * Get the current user
 */
export function getV1UsersCurrent(authorization: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 200;
        data: UserPrivate;
    }>("/v1/users/current", {
        ...opts,
        headers: {
            ...opts && opts.headers,
            Authorization: authorization
        }
    });
}
