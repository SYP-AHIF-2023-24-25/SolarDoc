import { defineStore } from 'pinia'
import constants from '@/plugins/constants'
import type {
  OTrans,
  OTransReqDto,
  OTransRespDto,
  RawDeleteOTrans,
  RawInsertOTrans,
} from '@/services/phoenix/ot-trans'
import type { File } from '@/services/phoenix/api-service'
import * as phoenixRestService from '@/services/phoenix/api-service'
import { PhoenixInternalError, PhoenixRestError } from '@/services/phoenix/errors'
import constants from '@/plugins/constants'
import { v4 as uuidv4 } from 'uuid'

const DEFAULT_NAME = 'untitled.adoc'
const DEFAULT_TEXT = '= Welcome to SolarDoc! \n\n== Your AsciiDoc web-editor °^°'

export const useCurrentFileStore = defineStore('currentFile', {
  state: () => {
    const storedFileId = localStorage.getItem(constants.localStorageFileIdKey)
    const storedFileOwner = localStorage.getItem(constants.localStorageFileOwnerKey)
    let storedFileName = localStorage.getItem(constants.localStorageFileNameKey)
    let storedFileContent = localStorage.getItem(constants.localStorageFileContentKey)

    // Ensure the default is populated if the stored content is empty or the file name is empty
    if (!storedFileName || storedFileName === '') {
      storedFileName = DEFAULT_NAME
      localStorage.setItem(constants.localStorageFileNameKey, DEFAULT_NAME)
    }

    if (!storedFileContent || storedFileContent === '') {
      storedFileContent = DEFAULT_TEXT
      localStorage.setItem(constants.localStorageFileContentKey, DEFAULT_TEXT)
    }
    
    return {
      fileId: <string | undefined>storedFileId || undefined,
      fileName: storedFileName,
      ownerId: storedFileOwner || undefined,
      saveState: storedFileId ? 'Saved Remotely' : 'Saved Locally',
      content: storedFileContent,
      oTransStack: new Map<string, OTrans>(),
      oTransNotAcked: <Array<OTransReqDto>>[],
      oTransNotPerf: <Array<OTransRespDto>>[],
    }
  },
  actions: {
    ensureUserIsAuthorisedForFile(userId: string) {
      if (!this.fileId || !this.ownerId) {
        this.clearFileId()
        this.clearOwnerId()
        this.setOnlineSaveState(false) // For safety
        return
      }

      if (this.ownerId !== userId) {
        this.closeFile()
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
          'Critically failed to fetch current user. Cause: ' + (<Error>e).message,
        )
      }

      if (resp.status === 201) {
        this.setFileId(resp.data.id)
        this.setOwnerId(resp.data.owner_id)
      } else if (resp.status === 400) {
        throw new PhoenixRestError(
          'Server rejected request to logout. Cause: Bad request',
          resp.status,
        )
      } else if (resp.status === 401) {
        throw new PhoenixRestError(
          'Server rejected request to fetch current user. Cause: Unauthorized',
          resp.status,
        )
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
          'Critically failed to fetch current user. Cause: ' + (<Error>e).message,
        )
      }

      if (resp.status === 400) {
        throw new PhoenixRestError(
          'Server rejected request to logout. Cause: Bad request',
          resp.status,
        )
      } else if (resp.status === 401) {
        throw new PhoenixRestError(
          'Server rejected request to fetch current user. Cause: Unauthorized',
          resp.status,
        )
      }
    },
    initOTransStackFromServerTrans(initOTrans: OTransRespDto) {
      this.oTransStack = new Map<string, OTrans>()
      this.oTransStack.set(initOTrans.id, {...initOTrans, acknowledged: true})
    },
    /**
     * Pushes an OTrans to the stack of transformations.
     *
     * This will check whether a current transformation is waiting to be acknowledged and if so, it will update that
     * transaction with the timestamp and then push the new transformation to the stack.
     * @param oTrans The OTrans object to push.
     * @since 0.5.0
     */
    pushOTransResp(oTrans: OTransRespDto) {
      const oTransWaiting = this.oTransStack.get(oTrans.id)
      if (oTransWaiting) {
        oTransWaiting.timestamp = oTrans.timestamp
        oTransWaiting.acknowledged = true
        this.oTransStack.set(oTrans.id, oTransWaiting)
      } else {
        // This is a new transformation
        this.oTransStack.set(oTrans.id, {...oTrans, acknowledged: true})

        // Perform the transformation on the current content
        if (oTrans.trans.type === 'insert') {
          this.content = this.content.slice(0, oTrans.trans.pos) + oTrans.trans.content + this.content.slice(oTrans.trans.pos);
        } else if (oTrans.trans.type === 'delete') {
          this.content = this.content.slice(0, oTrans.trans.pos) + this.content.slice(oTrans.trans.pos + oTrans.trans.length);
        }
      }
    },
    /**
     * Pushes an OTrans to the stack of transformations which are not yet acknowledged, but have been already applied
     * to the content.
     * @param oTrans The OTrans object to push.
     * @since 0.5.0
     */
    pushOTransReq(oTrans: OTransReqDto) {
      this.oTransNotAcked.push(oTrans)
    },
    /**
     * Creates an OTrans object which represents a change to the content.
     * @param insertOrDeleteTrans The raw insert or delete OTrans.
     * @returns The OTrans object.
     * @since 0.5.0
     */
    createOTrans(insertOrDeleteTrans: RawInsertOTrans | RawDeleteOTrans): OTransReqDto {
      return {
        id: uuidv4(),
        trans: insertOrDeleteTrans,
      }
    },
    createInsertOTrans(pos: number, content: string): OTransReqDto {
      return this.createOTrans({ type: 'insert', pos, content })
    },
    createDeleteOTrans(pos: number, length: number): OTransReqDto {
      return this.createOTrans({ type: 'delete', pos, length })
    },
    setOnlineSaveState(value: boolean) {
      this.saveState = value ? 'Saved Remotely' : 'Saved Locally'
    },
    setFile(file: Required<File>) {
      this.setFileId(file.id)
      this.setOwnerId(file.owner_id)
      this.setFileName(file.file_name)
      this.setContent(file.content)
      this.setOnlineSaveState(true)
    },
    setFileId(fileId: string) {
      this.fileId = fileId
      localStorage.setItem(constants.localStorageFileIdKey, fileId)
    },
    setOwnerId(ownerId: string) {
      this.ownerId = ownerId
      localStorage.setItem(constants.localStorageFileOwnerKey, ownerId)
    },
    clearFileId() {
      this.fileId = undefined
      localStorage.removeItem(constants.localStorageFileIdKey)
    },
    clearOwnerId() {
      this.ownerId = undefined
      localStorage.removeItem(constants.localStorageFileOwnerKey)
    },
    setFileName(fileName: string) {
      this.fileName = fileName
      localStorage.setItem(constants.localStorageFileNameKey, fileName)
    },
    setContent(content: string) {
      this.content = content
      localStorage.setItem(constants.localStorageFileContentKey, content)
    },
    closeFile() {
      this.clearFileId()
      this.setFileName(DEFAULT_NAME)
      this.setContent(DEFAULT_TEXT)
      this.setOnlineSaveState(false)
      this.clearOTransStack()
    },
    clearOTransStack() {
      this.oTransStack = new Map<string, OTrans>()
      this.oTransNotAcked = []
    },
  },
})
