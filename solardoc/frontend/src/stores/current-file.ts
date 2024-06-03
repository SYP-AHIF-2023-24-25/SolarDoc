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
import {showErrorNotifFromObj, showNotifFromErr, showWarnNotif} from "@/scripts/show-notif";
import {FileGoneWarn} from "@/errors/file-gone-warn";

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

export const useCurrentFileStore = defineStore('currentFile', {
  state: () => {
    const storedFileId = localStorage.getItem(constants.localStorageFileIdKey)
    const storedFileOwner = localStorage.getItem(constants.localStorageFileOwnerKey)
    const storedChannelId = localStorage.getItem(constants.localStorageFileChannelIdKey)
    let storedFileName = localStorage.getItem(constants.localStorageFileNameKey)
    let storedFileContent = localStorage.getItem(constants.localStorageFileContentKey)
    let storedLastModified = localStorage.getItem(constants.localStorageLastModifiedKey)
    let storedCreated = localStorage.getItem(constants.localStorageCreatedKey)
    let storedPermissions = localStorage.getItem(constants.localStorageFilePermissionsKey)

    // Ensure the default is populated if the stored content is empty or the file name is empty
    if (!storedFileName || storedFileName === '') {
      storedFileName = constants.defaultFileName
      localStorage.setItem(constants.localStorageFileNameKey, constants.defaultFileName)
    }

    if (!storedFileContent || storedFileContent === '') {
      storedFileContent = constants.defaultFileContent
      localStorage.setItem(constants.localStorageFileContentKey, constants.defaultFileContent)
    }

    if (!storedLastModified) {
      storedLastModified = new Date().toISOString()
      localStorage.setItem(constants.localStorageLastModifiedKey, storedLastModified)
    }

    if (!storedCreated) {
      storedCreated = new Date().toISOString()
      localStorage.setItem(constants.localStorageCreatedKey, storedCreated)
    }

    if (!storedPermissions) {
      storedPermissions = null
      localStorage.setItem(constants.localStorageFilePermissionsKey, '')
    }

    return {
      fileId: <string | undefined>storedFileId || undefined,
      fileName: storedFileName,
      ownerId: storedFileOwner || undefined,
      saveState: storedFileId ? constants.saveStates.server : constants.saveStates.local,
      content: storedFileContent,
      permissions: <Permission>(storedPermissions ? parseInt(storedPermissions) : null),
      oTransStack: new Map<string, OTrans>(),
      oTransNotAcked: new Map<string, OTransReqDto>(),
      lastTrans: <OTrans | undefined>undefined,
      lastModified: new Date(storedLastModified),
      channelId: storedChannelId || undefined,
      created: new Date(storedCreated),
    }
  },
  getters: {
    /**
     * Returns true if a remotely opened file is currently being edited.
     * @since 0.6.0
     */
    remoteFile(): boolean {
      return this.fileId !== undefined
    },
    raw(): File | undefined {
      if (!this.fileId || !this.ownerId) {
        return undefined
      }
      return {
        id: this.fileId,
        content: this.content,
        created: this.created.getTime(),
        file_name: this.fileName,
        last_edited: this.lastModified.getTime(),
        owner_id: this.ownerId,
        channel_id: this.channelId,
      }
    }
  },
  actions: {
    /**
     * Fetches the file data from the server and sets the current file with the response data.
     *
     * This is to make sure the data is up-to-date with the server.
     * @private
     */
    async fetchNewestRemoteFileVersionIfPossible(bearer?: string): Promise<void> {
      if (this.fileId === undefined || bearer == undefined) {
        return
      }

      let resp: Awaited<ReturnType<typeof phoenixRestService.getV1FilesById>>
      try {
        resp = await phoenixRestService.getV1FilesById(bearer, this.fileId)
      } catch (e) {
        throw new PhoenixInternalError(
          'Critically failed to fetch file. Cause: ' + (<Error>e).message,
        )
      }

      if (resp.status === 200) {
        this.setFile(resp.data)
      } else {
        await this.closeFile(true)

        // Show notification indicating that the file was not found
        showNotifFromErr(new FileGoneWarn())
      }
    },
    async ensureUserIsAuthorisedForFile(userId: string) {
      if (!this.fileId || !this.ownerId || this.ownerId !== userId) {
        await this.closeFile()
        this.setOnlineSaveState(false)
      }
    },
    async storeOnServer(bearer: string) {
      if (this.fileId === undefined) {
        await this.createFile(bearer)
      } else {
        await this.updateFile(bearer)
      }
      this.setOnlineSaveState(true)
    },
    async createFile(bearer: string) {
      let resp: Awaited<ReturnType<typeof phoenixRestService.postV1Files>>
      try {
        resp = await phoenixRestService.postV1Files(bearer, {
          file_name: this.fileName,
          content: this.content,
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
      if (this.fileId === undefined) {
        return await this.createFile(bearer)
      }

      let resp: Awaited<ReturnType<typeof phoenixRestService.putV1FilesById>>
      try {
        resp = await phoenixRestService.putV1FilesById(bearer, this.fileId, {
          file_name: this.fileName,
          content: this.content,
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

      const SolardocEditor = (await import('@/scripts/editor/editor')).SolardocEditor
      await SolardocEditor.applyOTUpdates(oTrans)
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
          this.content.slice(0, oTrans.trans.pos) +
            oTrans.trans.content +
            this.content.slice(oTrans.trans.pos),
        )
      } else if (oTrans.trans.type === 'delete') {
        this.setContent(
          this.content.slice(0, oTrans.trans.pos - oTrans.trans.length) +
            this.content.slice(oTrans.trans.pos),
        )
      }
    },
    setOnlineSaveState(value: boolean) {
      this.saveState = value ? constants.saveStates.server : constants.saveStates.local
    },
    setFile(file: File, perm: Permission = Permissions.Unknown) {
      this.setFileId(file.id)
      this.setOwnerId(file.owner_id)
      this.setFileName(file.file_name)
      this.setContent(file.content)
      this.setOnlineSaveState(true)
      this.setLastModified(new Date(file.last_edited))
      this.setPermissions(perm)
      this.setCreated(new Date(file.created))
      this.setChannelId(file.channel_id)
    },
    setFileId(fileId: string) {
      this.fileId = fileId
      localStorage.setItem(constants.localStorageFileIdKey, fileId)
    },
    setOwnerId(ownerId: string) {
      this.ownerId = ownerId
      localStorage.setItem(constants.localStorageFileOwnerKey, ownerId)
    },
    setFileName(fileName: string) {
      this.fileName = fileName
      localStorage.setItem(constants.localStorageFileNameKey, fileName)
    },
    setContent(content: string) {
      this.content = content
      localStorage.setItem(constants.localStorageFileContentKey, content)
    },
    setLastModified(lastModified: Date) {
      this.lastModified = lastModified
      localStorage.setItem(constants.localStorageLastModifiedKey, lastModified.toISOString())
    },
    setCreated(created: Date) {
      this.created = created
      localStorage.setItem(constants.localStorageCreatedKey, created.toISOString())
    },
    setChannelId(channelId: string | undefined) {
      this.channelId = channelId
      localStorage.setItem(
        constants.localStorageFileChannelIdKey,
        channelId ? channelId : '',
      )
    },
    clearFileId() {
      this.fileId = undefined
      localStorage.removeItem(constants.localStorageFileIdKey)
    },
    clearOwnerId() {
      this.ownerId = undefined
      localStorage.removeItem(constants.localStorageFileOwnerKey)
    },
    clearChannelId() {
      this.channelId = undefined
      localStorage.removeItem(constants.localStorageFileChannelIdKey)
    },
    resetLastModified() {
      this.setLastModified(new Date())
    },
    resetCreated() {
      this.setCreated(new Date())
    },
    setPermissions(permissions: Permission) {
      this.permissions = permissions
      localStorage.setItem(
        constants.localStorageFilePermissionsKey,
        permissions ? String(permissions) : '',
      )
    },
    async closeFile(preserveContent: boolean = false) {
      this.clearFileId()
      this.clearOTransStack()
      this.clearOwnerId()
      this.clearChannelId()
      this.setFileName(constants.defaultFileName)
      this.setOnlineSaveState(false)
      this.setPermissions(Permissions.Unknown)
      this.resetLastModified()
      this.resetCreated()

      if (!preserveContent) {
        this.setContent(constants.defaultFileContent)

        const SolardocEditor = (await import('@/scripts/editor/editor')).SolardocEditor
        SolardocEditor.setContent(constants.defaultFileContent)
      }
    },
    clearOTransStack() {
      this.oTransStack = new Map<string, OTrans>()
      this.oTransNotAcked = new Map<string, OTransReqDto>()
      this.lastTrans = undefined
    },
  },
})
