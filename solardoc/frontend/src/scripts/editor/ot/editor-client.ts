import {OTBaseClient} from "@/scripts/editor/ot/core/ot-client";
import type {OtherClient} from "@/scripts/editor/ot/other-client";
import type {EditorOTAdapter} from "@/scripts/editor/editor-ot-adapter";
import type {ServerOTAdapter} from "@/scripts/editor/server-ot-adapter";
import type {ClientDto} from "@/services/phoenix/client-dto";
import {Selection} from "@/scripts/editor/ot/core/selection";
import {AwaitingWithBuffer} from "@/scripts/editor/ot/core/awaiting-with-buffer";
import  {type TextOperation} from "@/scripts/editor/ot/text-operation";

export class EditorClient extends OTBaseClient {
  private readonly _clients: Record<string, OtherClient>
  private readonly _serverAdapter: ServerOTAdapter
  private readonly _editorAdapter: EditorOTAdapter
  private _selection: Selection | undefined

  constructor(revision: number, clients: Array<ClientDto>, serverAdapter: ServerOTAdapter, editorAdapter: EditorOTAdapter) {
    super(revision)
    this._clients = []
    this._serverAdapter = serverAdapter
    this._editorAdapter = editorAdapter
    this._selection = undefined
    this.initialiseClients(clients)

    editorAdapter.registerCallbacks(this)
    serverAdapter.registerCallbacks(this)
  }

  get clients(): Array<OtherClient> {
    return this._clients
  }

  get serverAdapter(): ServerOTAdapter {
    return this._serverAdapter
  }

  get editorAdapter(): EditorOTAdapter {
    return this._editorAdapter
  }

  get selection(): Selection | undefined {
    return this._selection
  }

  private initialiseClients(clients: Array<ClientDto>): void {
    for (const client of clients) {
      this.addClient(client)
    }
  }

  /**
   * Adds a client to the editor.
   * @param client The client to add.
   */
  addClient(client: ClientDto): OtherClient {
    return this._clients[client.clientId] = new OtherClient(
      client.clientId,
      this._editorAdapter,
      client.selection ? Selection.fromDto(client.selection) : undefined,
      client.name
    )
  }

  /**
   * Gets the client with the given ID. Creates a new client if one does not exist.
   * @param clientId The ID of the client to get.
   */
  getClient(clientId: string): OtherClient {
    const localClient: OtherClient | undefined = this._clients[clientId]
    return localClient ?? this.addClient(new OtherClient(clientId, this._editorAdapter, undefined, clientId))
  }

  updateSelection(): void {
    this._selection = this.editorAdapter.getSelection();
  }

  async sendSelection(selection: Selection): Promise<void> {
    if (!(this.getState() instanceof AwaitingWithBuffer)) {
      this.serverAdapter.sendSelection(selection)
    }
  }

  async sendOperation(revision: number, operation: TextOperation): Promise<void> {
    this.serverAdapter.sendOperation(revision, operation, this._selection)
  }

  async applyOperation(operation: TextOperation): Promise<void> {
    this.editorAdapter.applyOperation(operation)
    this.updateSelection();
  }

  // ----------------------
  // Event Handlers Section
  // ----------------------
}
