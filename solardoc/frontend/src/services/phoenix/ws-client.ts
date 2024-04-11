import {
  socket,
  Channel,
  type ConnectionState,
  type ChannelState,
  type PhoenixSocket as SDSClientBare,
} from '@solardoc/phoenix'
import { PhoenixInternalError, PhoenixInvalidOperationError } from '@/services/phoenix/errors'
import type { CreateEditorChannel, EditorChannel } from '@/services/phoenix/editor-channel'
import type { OTransRespDto } from '@/services/phoenix/ot-trans'
import type { File } from '@/services/phoenix/api-service'

/**
 * The SolarDoc Socket client (SDS) is a Phoenix Channels client that connects to the SolarDoc Phoenix server. It is
 * used to communicate with the server over websockets.
 *
 * Once constructed this will automatically attempt to connect to the server. If the user token is not passed in, it
 * will attempt to use the global `window.userToken` variable. If that is also not set, it will throw an error.
 * @since 0.4.0
 */
export class SDSClient {
  private readonly socket: SDSClientBare
  private _active: boolean
  private _currentChannel: Channel | undefined

  constructor(url: string, userToken?: string) {
    this.socket = socket(url, userToken)
    this._active = true

    this.socket.onMessage(message => {
      console.log('[ws-client.ts] Received message:', message)
    })
  }

  /**
   * Returns true if the socket is connecting/connected to the server, false otherwise.
   * @since 0.4.0
   */
  public get active() {
    return this._active
  }

  /**
   * Returns the current connection state of the socket.
   */
  public get connectionState(): ConnectionState {
    return this.socket.connectionState()
  }

  /**
   * Returns true if the socket is connected to the server and the connection state is 'open', false otherwise.
   * @since 0.4.0
   */
  public get healthy() {
    return this.active && this.connectionState === 'open'
  }

  /**
   * Returns true if the channel has been successfully joined and the connection is active.
   * @since 0.4.0
   */
  public get channelHealthy(): boolean {
    return this.currentChannelState === 'joined'
  }

  /**
   * Disconnects the socket from the server.
   * @since 0.4.0
   */
  public disconnect() {
    this.socket.disconnect(() => void (this._active = false))
  }

  /**
   * Returns the current state of the channel that is joined, if any.
   * @since 0.4.0
   */
  public get currentChannelState(): ChannelState | undefined {
    return this._currentChannel?.state
  }

  private async _ensureSocketIsHealthy(): Promise<void> {
    await this._waitForSocketToBeHealthyIfConnecting()
    if (!this._active) {
      throw new PhoenixInvalidOperationError(
        '[ws-client.ts] Cannot perform operation on a closed socket.',
      )
    }
  }

  private async _waitForSocketToBeHealthyIfConnecting(): Promise<void> {
    if (this.connectionState === 'connecting') {
      return new Promise<void>(resolve => {
        const interval = setInterval(() => {
          if (this.healthy) {
            clearInterval(interval)
            resolve()
          }
        }, 100)
      })
    }
  }

  private async _ensureChannelIsHealthy(): Promise<void> {
    await this._waitForChannelToBeHealthyIfConnecting()
    if (!this.channelHealthy) {
      throw new PhoenixInvalidOperationError(
        '[ws-client.ts] Cannot perform operation on a channel that has not been joined.',
      )
    }
  }

  private async _waitForChannelToBeHealthyIfConnecting(): Promise<void> {
    if (this.currentChannelState === 'joining') {
      return new Promise<void>(resolve => {
        const interval = setInterval(() => {
          if (this.channelHealthy) {
            clearInterval(interval)
            resolve()
          }
        }, 100)
      })
    }
  }

  private async _handleJoinChannel(
    currUserId: string,
    onJoin: (initTrans: OTransRespDto, file: Required<File>) => void | Promise<void>,
    onError: (resp: any) => void | Promise<void>,
    resp: {},
  ) {
    if (!('user_id' in resp)) {
      this._leaveChannelAndEnsureDestruction()
      onError(new PhoenixInternalError('[ws-client.ts] Server did not return a valid response.'))
    }

    const validResp = resp as {
      user_id: string
      init_trans: OTransRespDto
      file: Required<File>
    }
    if (validResp.user_id === currUserId) {
      onJoin(validResp.init_trans, validResp.file)
    }
  }

  /**
   * Attempts to join the specified channel with the given parameters.
   *
   * Note that this function will immediately abort joining the channel if an error occurs i.e. the default retry
   * behaviour is not used here. If the channel is successfully joined, the `onJoin` function will be called with the
   * response from the server.
   * @param topic The topic of the channel to join.
   * @param currUserId The current user's ID.
   * @param params The parameters to pass to the channel.
   * @param onJoin The function to call when the channel is successfully joined.
   * @param onError The function to call when the channel fails to join.
   * @throws PhoenixInvalidOperationError If the socket is not healthy.
   * @since 0.4.0
   */
  public async joinChannel<T extends {} | undefined = undefined>(
    topic: string,
    onJoin: (initTrans: OTransRespDto, file: Required<File>) => void | Promise<void>,
    onError: (resp: any) => void | Promise<void>,
    currUserId: string,
    params?: T,
  ): Promise<void> {
    await this._ensureSocketIsHealthy()
    this._currentChannel = this.socket.channel(topic, params)
    this._currentChannel.on('user_join', resp => {
      this._handleJoinChannel(currUserId, onJoin, onError, resp)
    })
    this._currentChannel
      .join()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .receive('ok', _ => console.log('[ws-client.ts] Channel successfully joined!'))
      .receive('error', resp => {
        onError(resp)
        this._leaveChannelAndEnsureDestruction()
      })
  }

  private async _leaveChannelNew(): Promise<void> {
    if (this._currentChannel?.topic === 'channel:new') {
      this._leaveChannelAndEnsureDestruction()
    }
  }

  private async _handleCreateChannel(
    creatorId: string,
    onJoin: (resp: EditorChannel, initTrans: OTransRespDto) => void | Promise<void>,
    onError: (resp: any) => void | Promise<void>,
    resp: {},
  ) {
    if (!('creator_id' in resp)) {
      this._leaveChannelAndEnsureDestruction()
      onError(new PhoenixInternalError('[ws-client.ts] Server did not return a valid response.'))
    }

    const validResp = resp as {
      creator_id: string
      editor_channel: EditorChannel
      init_trans: OTransRespDto
    }
    if (validResp.creator_id === creatorId) {
      await this._leaveChannelNew()
      onJoin(validResp.editor_channel, validResp.init_trans)
    }
  }

  /**
   * Creates a new editor channel with the given parameters.
   *
   * This will automatically join the channel if it is successfully created. If the channel is successfully joined, the
   * `onJoin` function will be called with the response from the server.
   * @param onJoin The function to call when the channel is successfully joined.
   * @param onError The function to call when the channel fails to join.
   * @param editorChannel The parameters to pass to the channel.
   * @param editorState The initial state of the editor.
   * @param currUserId The current user's ID.
   * @throws PhoenixInvalidOperationError If the socket is not healthy.
   * @since 0.4.0
   */
  public async createChannel(
    onJoin: (resp: EditorChannel, initTrans: OTransRespDto) => void | Promise<void>,
    onError: (resp: any) => void | Promise<void>,
    editorChannel: CreateEditorChannel,
    editorState: string,
    currUserId: string,
  ): Promise<void> {
    await this._ensureSocketIsHealthy()
    this._currentChannel = this.socket.channel('channel:new', {
      data: editorChannel,
      state: editorState,
    })
    this._currentChannel.on('new_channel', resp =>
      this._handleCreateChannel(currUserId, onJoin, onError, resp),
    )
    this._currentChannel
      .join()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .receive('ok', _ => console.log('[ws-client.ts] Channel successfully created!'))
      .receive('error', resp => {
        onError(resp)
        this._leaveChannelAndEnsureDestruction()
      })
  }

  /**
   * Sends an operational transformation to the server.
   * @param update The transformation to be sent to the server.
   * @param onSuccess The function to call when the server successfully receives the update.
   * @param onError The function to call when the server fails to receive the update.
   * @throws PhoenixInvalidOperationError If the socket is not healthy.
   * @throws PhoenixInvalidOperationError If the channel is not healthy.
   * @since 0.4.0
   */
  public async sendOTrans(
    update: OTransRespDto,
    onSuccess: (resp: any) => void | Promise<void>,
    onError: (resp: any) => void | Promise<void>,
  ): Promise<void> {
    await this._ensureSocketIsHealthy()
    await this._ensureChannelIsHealthy()
    this._currentChannel!.push('state_trans', update)
      .receive('ok', onSuccess)
      .receive('error', onError)
      .send()
  }

  /**
   * Internal function to leave the current channel, this is primarily used for error handling cleanup.
   * @private
   */
  private _leaveChannelAndEnsureDestruction(): void {
    if (this._currentChannel) {
      this._currentChannel.leave()
      this.socket.remove(this._currentChannel)
      this._currentChannel = undefined
    }
  }

  /**
   * Leaves the current channel.
   * @throws PhoenixInvalidOperationError If no channel has been joined.
   * @since 0.4.0
   */
  public async leaveChannel(): Promise<void> {
    await this._ensureSocketIsHealthy()
    if (!this._currentChannel) {
      throw new PhoenixInvalidOperationError(
        '[ws-client.ts] Cannot leave a channel when none has been joined.',
      )
    }
    await this._ensureChannelIsHealthy()
    this._leaveChannelAndEnsureDestruction()
  }
}
