import { defineStore } from 'pinia'
import type { OTrans, OTransReqDto, OTransRespDto } from '@/services/phoenix/ot-trans'
import type { File } from '@/services/phoenix/api-service'
import * as phoenixRestService from '@/services/phoenix/api-service'
import {
  type ActualPhxErrorResp,
  PhoenixBadRequestError,
  PhoenixInternalError,
  PhoenixNotAuthorisedError,
} from '@/services/phoenix/errors'
import constants from '@/plugins/constants'
import { isDev } from '@/config/env'
import { KipperFileNotFoundError } from '@/errors/file-not-found-error'

export type Unknown = null
export type NoPermissions = 0
export type ReadPermission = 1
export type WritePermission = 3
export type Permission = Unknown | NoPermissions | ReadPermission | WritePermission
export const Permissions = {
  Unknown: null,
  None: 0,
  Read: 1,
  Write: 3,
} as const satisfies { [key: string]: Permission }

async function setGlobalEditorContentIfAvailable(content: string) {
  const SolardocEditor = (await import('@/scripts/editor/editor')).SolardocEditor
  SolardocEditor.setContentIfAvailable(content)
}

async function applyGlobalEditorOTransIfAvailable(oTrans: OTrans) {
  const SolardocEditor = (await import('@/scripts/editor/editor')).SolardocEditor
  await SolardocEditor.applyOTrans(oTrans)
}

export interface LocalFile {
  id: string | undefined
  content: string
  created: number
  file_name: string
  last_edited: number
  owner_id: string | undefined
  channel_id: string | undefined
  is_global: boolean
}

function getDefaultFile(currentUserId?: string, empty?: boolean): LocalFile | File {
  return {
    id: undefined,
    content: empty ? '' : constants.defaultFileContent,
    created: new Date().getTime(),
    file_name: constants.defaultFileName,
    last_edited: new Date().getTime(),
    owner_id: currentUserId,
    channel_id: undefined,
    is_global: false,
  }
}

function ensureAllFileProperties(raw: object): LocalFile | File {
  const file = getDefaultFile()
  file.id = <string | undefined>('id' in raw ? raw.id : file.id)
  file.content = <string>('content' in raw && raw.content ? raw.content : file.content)
  file.created = <number>('created' in raw && raw.created ? raw.created : file.created)
  file.file_name = <string>('file_name' in raw && raw.file_name ? raw.file_name : file.file_name)
  file.last_edited = <number>(
    ('last_edited' in raw && raw.last_edited ? raw.last_edited : file.last_edited)
  )
  file.owner_id = <string | undefined>(
    ('owner_id' in raw && raw.owner_id ? raw.owner_id : file.owner_id)
  )
  file.channel_id = <string | undefined>(
    ('channel_id' in raw && raw.channel_id ? raw.channel_id : file.channel_id)
  )
  file.is_global = <boolean>('is_global' in raw && raw.is_global ? raw.is_global : file.is_global)
  return file
}

function writeFileToLocalStorage(file: LocalFile | File): void {
  localStorage.setItem(constants.localStorageFileKey, JSON.stringify(file))
}

export const useCurrentFileStore = defineStore('currentFile', {
  state: () => {
    return {
      file: getDefaultFile(undefined, true),
      shareURLId: <string | undefined>undefined,
      accessPermissions: <Permission>Permissions.Unknown,
      oTransStack: new Map<string, OTrans>(),
      oTransNotAcked: new Map<string, OTransReqDto>(),
      lastTrans: <OTrans | undefined>undefined,
      fileNameUpdated: false,
    }
  },
  getters: {
    isFileNameUpdated(): boolean {
      return this.fileNameUpdated
    },
    /**
     * Returns true if a remotely opened file is currently being edited.
     * @since 0.6.0
     */
    remoteFile(): boolean {
      return this.file.id !== undefined
    },
    /**
     * Returns true if the current file is shared with the user.
     * @since 0.7.0
     */
    shareFile(): boolean {
      return this.shareURLId !== undefined
    },
    /**
     * Returns true if the current file is a share file and accessible by the user.
     * @since 0.7.0
     */
    isAccessibleShareFile(): boolean {
      return (
        this.shareFile &&
        (this.accessPermissions === Permissions.Read ||
          this.accessPermissions === Permissions.Write)
      )
    },
    /**
     * Returns the raw dto file object.
     * @since 0.7.0
     */
    raw(): LocalFile | File {
      return this.file
    },
    /**
     * COMPATIBILITY MODE LAYER FOR FILE PROPERTIES
     *
     * Returns the current file id.
     */
    fileId(): string | undefined {
      return this.file.id satisfies string | undefined
    },
    /**
     * COMPATIBILITY MODE LAYER FOR FILE PROPERTIES
     *
     * Returns the current file owner id.
     */
    ownerId(): string | undefined {
      return this.file.owner_id satisfies string | undefined
    },
    /**
     * COMPATIBILITY MODE LAYER FOR FILE PROPERTIES
     *
     * Returns the current file name.
     */
    fileName(): string {
      return this.file.file_name satisfies string
    },
    /**
     * COMPATIBILITY MODE LAYER FOR FILE PROPERTIES
     *
     * Returns the current file content.
     */
    content(): string {
      return this.file.content satisfies string
    },
    /**
     * COMPATIBILITY MODE LAYER FOR FILE PROPERTIES
     *
     * Returns the last modified date of the current file.
     */
    lastModified(): Date {
      return new Date(this.file.last_edited satisfies number)
    },
    /**
     * COMPATIBILITY MODE LAYER FOR FILE PROPERTIES
     *
     * Returns the created date of the current file.
     */
    created(): Date {
      return new Date(this.file.created satisfies number)
    },
    /**
     * COMPATIBILITY MODE LAYER FOR FILE PROPERTIES
     *
     * Returns the channel id of the current file.
     */
    channelId(): string | undefined {
      return this.file.channel_id satisfies string | undefined
    },
    /**
     * COMPATIBILITY MODE LAYER FOR FILE PROPERTIES
     *
     * Returns the global flag of the current file.
     */
    isGlobal(): boolean {
      return this.file.is_global satisfies boolean
    },
    /**
     * COMPATIBILITY MODE LAYER FOR ACCESS PERMISSIONS
     *
     * Returns the current access permissions for the current file.
     */
    permissions(): Permission {
      return this.accessPermissions satisfies Permission
    },
  },
  actions: {
    /**
     * Resets the store and sets the content to the default file content.
     * @since 1.0.0
     */
    setFileToDefaultState(currentUserId?: string, empty?: boolean) {
      this.setFile(getDefaultFile(currentUserId, empty))
    },
    /**
     * Loads the data from the local storage into the store.
     *
     * This will fall back to a default file in case the local storage is empty or the data is corrupted.
     * @since 1.0.0
     */
    setFileFromLocalStorage() {
      let storedFile: LocalFile | File
      try {
        storedFile = ensureAllFileProperties(
          JSON.parse(localStorage.getItem(constants.localStorageFileKey) || ''),
        )
      } catch (e) {
        storedFile = getDefaultFile()
      }
      this.setFile(storedFile)
    },
    /**
     * Sets the store to a file from the server using a file id and a bearer to fetch the data.
     * @param fileId The file id which should be used to fetch the file data.
     * @param bearer The bearer token to use for the request.
     */
    async setFileWithRemoteId(fileId: string, bearer?: string) {
      this.setFileId(fileId)
      await this.fetchNewestRemoteFileVersionIfPossible(bearer)
    },
    /**
     * Fetches the file data from the server and sets the current file with the response data.
     *
     * This is to make sure the data is up-to-date with the server.
     * @since 1.0.0
     */
    async fetchNewestRemoteFileVersionIfPossible(bearer?: string): Promise<void> {
      if (this.file.id === undefined) {
        return
      }

      let resp: Awaited<
        ReturnType<
          typeof phoenixRestService.getV2FilesById | typeof phoenixRestService.getV2ShareByIdFile
        >
      >
      try {
        resp = this.shareFile
          ? await phoenixRestService.getV2ShareByIdFile(bearer || '', this.shareURLId!)
          : await phoenixRestService.getV2FilesById(bearer || '', this.file.id)
      } catch (e) {
        throw new PhoenixInternalError(
          'Critically failed to fetch file. Cause: ' + (<Error>e).message,
        )
      }

      if (resp.status === 200) {
        this.setFile(resp.data)
      } else {
        throw new KipperFileNotFoundError()
      }
    },
    /**
     * This should only be called once the data was fetched and the file data was updated (in case it's a remote file).
     * @param userId The user ID to check for authorisation.
     */
    async ensureUserIsAuthorisedForFile(userId: string) {
      if (!this.file.id || !this.file.owner_id) {
        // Local file
        return
      } else if (this.file.id && (this.file.owner_id === userId || this.isAccessibleShareFile)) {
        // Remote file
        return
      }
      await this.closeFileGlobally()
    },
    async storeOnServer(bearer: string) {
      if (this.file.id === undefined) {
        await this.createFile(bearer)
      } else {
        await this.updateFile(bearer)
      }
      this.setIsFileNameUpdated(false)
    },
    async createFile(bearer: string) {
      let resp: Awaited<ReturnType<typeof phoenixRestService.postV2Files>>
      try {
        resp = await phoenixRestService.postV2Files(bearer, {
          file_name: this.file.file_name,
          content: this.file.content,
        })
      } catch (e) {
        throw new PhoenixInternalError(
          'Critically failed to create file. Cause: ' + (<Error>e).message,
        )
      }

      if (resp.status === 201) {
        this.setFileId(resp.data.id)
        this.setOwnerId(resp.data.owner_id)
      } else if (resp.status === 400) {
        throw new PhoenixBadRequestError(
          `Server rejected request to create and upload file`,
          resp.data as ActualPhxErrorResp,
        )
      } else if (resp.status === 401) {
        throw new PhoenixNotAuthorisedError('Server rejected request to create and upload file')
      }
    },
    async updateFile(bearer: string) {
      if (this.file.id === undefined) {
        return await this.createFile(bearer)
      }

      let resp: Awaited<ReturnType<typeof phoenixRestService.putV2FilesById>>
      try {
        resp = await phoenixRestService.putV2FilesById(bearer, this.file.id, {
          file_name: this.file.file_name,
          content: this.file.content,
        })
      } catch (e) {
        throw new PhoenixInternalError(
          'Critically failed to put file. Cause: ' + (<Error>e).message,
        )
      }

      if (resp.status === 400) {
        throw new PhoenixBadRequestError(
          'Server rejected request to save file',
          resp.data as ActualPhxErrorResp,
        )
      } else if (resp.status === 401) {
        throw new PhoenixNotAuthorisedError('Server rejected request to save file')
      }
    },
    async initOTransStackFromServerTrans(initOTransDto: OTransRespDto) {
      this.clearOTransStack()
      await this.pushOTrans({
        ...initOTransDto,
        acknowledged: true,
        init: true,
      })
    },
    /**
     * "Pushes" an OTrans object to the {@link oTransStack stack of transformations}.
     *
     * This will also modify the {@link lastTrans}.
     * @param oTrans The OTrans object to push.
     * @since 0.5.0
     * @see lastTrans
     * @see oTransStack
     */
    async pushOTrans(oTrans: OTrans) {
      this.lastTrans = oTrans
      this.oTransStack.set(oTrans.id, oTrans)
      await applyGlobalEditorOTransIfAvailable(oTrans)
    },
    /**
     * "Pushes" an OTrans to the {@link oTransStack stack of transformations}.
     *
     * This will check whether a current transformation is waiting to be acknowledged and if so, it will update that
     * transaction with the timestamp and then push the new transformation to the stack.
     * @param oTrans The OTrans object to push.
     * @since 0.5.0
     */
    async pushOTransResp(oTrans: OTransRespDto) {
      const oTransWaiting = this.oTransNotAcked.get(oTrans.id)
      if (oTransWaiting) {
        const ackedTrans: OTrans = {
          ...oTransWaiting,
          user_id: oTrans.user_id,
          timestamp: oTrans.timestamp,
          acknowledged: true,
          init: false,
        }
        await this.pushOTrans(ackedTrans)
      } else {
        // This is a new transformation
        const newTrans: OTrans = {
          ...oTrans,
          acknowledged: true,
          init: false,
        }
        await this.pushOTrans(newTrans)
        this.applyOTrans(newTrans)
      }
    },
    /**
     * Pushes an OTrans to the stack of transformations which are not yet acknowledged, but have been already applied
     * to the content.
     * @param oTrans The OTrans object to push.
     * @since 0.5.0
     */
    async pushOTransReq(oTrans: OTransReqDto) {
      this.oTransNotAcked.set(oTrans.id, oTrans)
      this.applyOTrans(oTrans)
    },
    /**
     * Applies an OTrans to the current content.
     *
     * This should only be called inside this store.
     * @param oTrans The OTrans object to apply.
     * @since 0.7.0
     * @private
     */
    applyOTrans(oTrans: OTrans | OTransReqDto) {
      // Perform the transformation on the current content
      if (oTrans.trans.type === 'insert') {
        this.setContent(
          this.file.content.slice(0, oTrans.trans.pos) +
            oTrans.trans.content +
            this.file.content.slice(oTrans.trans.pos),
        )
      } else if (oTrans.trans.type === 'delete') {
        this.setContent(
          this.file.content.slice(0, oTrans.trans.pos - oTrans.trans.length) +
            this.file.content.slice(oTrans.trans.pos),
        )
      }
      this.setLastModified(new Date())
    },
    setFile(file: LocalFile | File, perm: Permission = Permissions.Unknown) {
      this.setFileId(file.id)
      this.setOwnerId(file.owner_id)
      this.setFileName(file.file_name)
      this.setContent(file.content)
      this.setLastModified(file.last_edited)
      this.setPermissions(perm)
      this.setCreated(file.created)
      this.setChannelId(file.channel_id)
      this.setIsGlobal(file.is_global)
    },
    setIsFileNameUpdated(isUpdated: boolean) {
      this.fileNameUpdated = isUpdated
    },

    setFileFromShared(file: File, shareURLId: string, perm: Permission = Permissions.Read) {
      this.setShareURLId(shareURLId)
      this.setFile(file, perm)
    },
    setFileId(fileId: string | undefined) {
      this.file.id = fileId
      this.saveIfLocalFile()
    },
    setOwnerId(ownerId: string | undefined) {
      this.file.owner_id = ownerId
      this.saveIfLocalFile()
    },
    setFileName(fileName: string) {
      this.file.file_name = fileName
      this.saveIfLocalFile()
    },
    setContent(content: string) {
      // For debug purposes
      if (isDev) {
        console.log('[File] Debug content:', { content: this.content })
      }
      this.file.content = content
      this.saveIfLocalFile()
    },
    setLastModified(lastModified: number | Date) {
      this.file.last_edited = lastModified instanceof Date ? lastModified.getTime() : lastModified
      this.saveIfLocalFile()
    },
    setCreated(created: number | Date) {
      this.file.created = created instanceof Date ? created.getTime() : created
      this.saveIfLocalFile()
    },
    setChannelId(channelId: string | undefined) {
      this.file.channel_id = channelId
      this.saveIfLocalFile()
    },
    setShareURLId(shareURLId: string) {
      this.shareURLId = shareURLId
      localStorage.setItem(constants.localStorageShareURLIdKey, shareURLId)
    },
    setIsGlobal(isGlobal: boolean) {
      this.file.is_global = isGlobal
      this.saveIfLocalFile()
    },
    clearFileId() {
      this.file.id = undefined
      this.saveIfLocalFile()
    },
    clearOwnerId() {
      this.file.owner_id = undefined
      this.saveIfLocalFile()
    },
    clearChannelId() {
      this.file.channel_id = undefined
      this.saveIfLocalFile()
    },
    clearShareURLId() {
      this.shareURLId = undefined
      localStorage.removeItem(constants.localStorageShareURLIdKey)
    },
    resetLastModified() {
      this.setLastModified(new Date())
    },
    resetCreated() {
      this.setCreated(new Date())
    },
    resetIsGlobal() {
      this.file.is_global = false
    },
    setPermissions(accessPermissions: Permission) {
      this.accessPermissions = accessPermissions
    },
    /**
     * Closes the file and resets the entire store, as well as resets the state of the global editor if it is present.
     *
     * DANGEROUS FUNCTION: This will clear the entire store and reset it to the default state. If you are still hooked
     * to the editor and potentially are still in a sync channel with the server, this will reset all of that.
     * @param options.preserveContent If true, the content will not be reset to the default content. Takes presedence over
     * `emptyContent`.
     * @param options.emptyContent If true, the content will be reset to an empty string.
     * @since 0.7.0
     */
    async closeFileGlobally(options?: { preserveContent?: boolean; emptyContent?: boolean }) {
      this.clearFileId()
      this.clearOTransStack()
      this.clearOwnerId()
      this.clearChannelId()
      this.clearShareURLId()
      this.setFileName(constants.defaultFileName)
      this.setPermissions(Permissions.Unknown)
      this.resetLastModified()
      this.resetCreated()
      this.resetIsGlobal()
      this.setIsFileNameUpdated(false)

      if (!options?.preserveContent) {
        this.setContent(options?.emptyContent ? '' : constants.defaultFileContent)
        await setGlobalEditorContentIfAvailable(this.content)
      }
    },
    clearOTransStack() {
      this.oTransStack = new Map<string, OTrans>()
      this.oTransNotAcked = new Map<string, OTransReqDto>()
      this.lastTrans = undefined
    },
    /**
     * Saves the current file to the local storage if its a local file.
     *
     * Otherwise, this function does nothing.
     * @since 1.0.0
     */
    saveIfLocalFile(): void {
      if (!this.remoteFile) {
        writeFileToLocalStorage(this.file)
      }
    },
  },
})
