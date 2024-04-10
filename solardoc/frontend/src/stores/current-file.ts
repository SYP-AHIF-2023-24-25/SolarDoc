import type {OTTrans, RawDeleteOTTrans, RawInsertOTTrans} from "@/services/phoenix/ot-trans"
import * as phoenixRestService from '@/services/phoenix/api-service'
import constants from '@/plugins/constants'
import {PhoenixInternalError, PhoenixRestError} from "@/services/phoenix/errors"
import {v4 as uuidv4} from 'uuid'
import {defineStore} from 'pinia'

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
      otTransStack: <Array<OTTrans>>[],
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
        resp = await phoenixRestService.postV1Files(
          bearer,
          {
            file_name: this.fileName,
            content: this.content,
          },
        )
      } catch (e) {
        throw new PhoenixInternalError(
          'Critically failed to fetch current user. Cause: ' + (<Error>e).message,
        )
      }

      if (resp.status === 201) {
        this.setFileId(resp.data.id!)
        this.setOwnerId(resp.data.owner_id!)
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
        resp = await phoenixRestService.putV1FilesById(
          bearer,
          this.fileId,
          {
            file_name: this.fileName,
            content: this.content,
          },
        )
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
    initOTTransStack(initOTTrans: OTTrans) {
      this.otTransStack = [initOTTrans]
    },
    pushOTTrans(otTrans: OTTrans) {
      // TODO! Insert transformation and compare to the latest transformations
    },
    /**
     * Creates an OTTrans object which represents a change to the content.
     * @param insertOrDeleteTrans The raw insert or delete OTTrans.
     * @param authorId The id of the author.
     * @returns The OTTrans object.
     * @since 0.5.0
     */
    createOTTrans(insertOrDeleteTrans: RawInsertOTTrans | RawDeleteOTTrans, authorId: string): OTTrans {
      // Ensure that the pos and length are within the bounds of the content
      if (insertOrDeleteTrans.type === 'insert') {
        if (insertOrDeleteTrans.pos < 0 || insertOrDeleteTrans.pos > this.content.length) {
          throw new Error('[current-file.ts] Position or length are out of bounds of the current state')
        }
      } else if (insertOrDeleteTrans.pos < 0 || insertOrDeleteTrans.pos + insertOrDeleteTrans.length > this.content.length) {
        throw new Error('[current-file.ts] Position or length are out of bounds of the current state')
      }

      return {
        id: uuidv4(),
        timestamp: undefined,
        user_id: authorId,
        trans: insertOrDeleteTrans,
        acknowledged: false,
      }
    },
    createInsertOTTrans(pos: number, content: string, userId: string): OTTrans {
      return this.createOTTrans({type: 'insert', pos, content}, userId)
    },
    createDeleteOTTrans(pos: number, length: number, userId: string): OTTrans {
      return this.createOTTrans({type: 'delete', pos, length}, userId)
    },
    setOnlineSaveState(value: boolean) {
      this.saveState = value ? 'Saved Remotely' : 'Saved Locally'
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
      this.clearOTTransStack()
    },
    clearOTTransStack() {
      this.otTransStack = []
    }
  },
})
