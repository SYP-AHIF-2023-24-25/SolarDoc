/**
 * This file simply adds the property 'userToken' to the window type (Pure d.ts file).
 *
 * This is used to pass the user token from the server to the client.
 * @since 0.4.0
 */

interface Window {
  userToken?: string;
}
