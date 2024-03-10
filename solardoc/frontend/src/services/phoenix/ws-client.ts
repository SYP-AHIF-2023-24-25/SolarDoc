import wsClient from "@solardoc/phoenix";

export type SDSClientBare = ReturnType<typeof wsClient>;

/**
 * The SolarDoc Socket client (SDS) is a Phoenix Channels client that connects to the SolarDoc Phoenix server. It is
 * used to communicate with the server over websockets.
 *
 * Once constructed this will automatically attempt to connect to the server. If the user token is not passed in, it
 * will attempt to use the global `window.userToken` variable. If that is also not set, it will throw an error.
 * @since 0.4.0
 */
export class SDSClient {
  private readonly socket: SDSClientBare;
  private _open: boolean;

  constructor(url: string, userToken?: string) {
    this.socket = wsClient(url, userToken);
    this._open = true;
  }

  /**
   * Returns true if the socket is connected to the server, false otherwise.
   * @since 0.4.0
   */
  public get open() {
    return this._open;
  }

  /**
   * Disconnects the socket from the server.
   * @since 0.4.0
   */
  public disconnect() {
    this.socket.disconnect(
      () => void (this._open = true)
    );
  }
}
