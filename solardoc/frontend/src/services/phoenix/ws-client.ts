import {socket, Channel, type PhoenixSocket as SDSClientBare} from "@solardoc/phoenix";
import {PhoenixSDSError} from "@/services/phoenix/errors";

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
  private _currentChannel: Channel | null = null;

  constructor(url: string, userToken?: string) {
    this.socket = socket(url, userToken);
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
      () => void (this._open = false)
    );
  }

  /**
   * Attempts to join the specified channel with the given parameters.
   * @param topic The topic of the channel to join.
   * @param params The parameters to pass to the channel.
   * @param onJoin
   * @throws PhoenixSDSError If connecting to the channel fails.
   * @since 0.4.0
   */
  public joinChannel<T extends {} | undefined = undefined>(
    topic: string,
    params?: T,
    onJoin?: (resp: any) => void | Promise<void>
  ): void {
    const channel = this.socket.channel(topic, params)
    channel.join()
      .receive("ok", resp => onJoin ? onJoin(resp) : void 0)
      .receive("error", (resp) => {
        throw new PhoenixSDSError(`Failed to join channel: ${resp.reason}`);
      });
  }
}
