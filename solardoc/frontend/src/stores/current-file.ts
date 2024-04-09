import type {OTTrans, RawDeleteOTTrans, RawInsertOTTrans} from "@/services/phoenix/ot-trans"
import * as phoenixRestService from '@/services/phoenix/api-service'
import constants from '@/plugins/constants'
import {PhoenixInternalError, PhoenixRestError} from "@/services/phoenix/errors"
import {v4 as uuidv4} from 'uuid'
import {defineStore} from 'pinia'

const DEFAULT_TEXT = '= Welcome to SolarDoc! \n\n== Your AsciiDoc web-editor °^°'

export const useCurrentFileStore = defineStore('currentFile', {
  state: () => {
    const storedFileId = localStorage.getItem(constants.localStorageFileIdKey);
    return {
      fileId: <string | undefined>storedFileId || undefined,
      fileName: localStorage.getItem(constants.localStorageFileNameKey) || 'untitled.adoc',
      saveState: storedFileId ? 'Saved Remotely' : 'Saved Locally',
      content: localStorage.getItem(constants.localStorageTextKey) || DEFAULT_TEXT,
      otTransStack: <Array<OTTrans>>[],
    }
  },
  actions: {
    async storeOnServer(bearer: string) {
      if (this.fileId === undefined) {
        await this.createFile(bearer)
      } else {
        await this.updateFile(bearer)
      }
      this.saveState = 'Saved Remotely'
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
    pushOTTrans(otTrans: OTTrans) {
      // TODO! Apply the OTTrans to the content
    },
    createOTTrans(insertOrDeleteTrans: RawInsertOTTrans | RawDeleteOTTrans): OTTrans {
      return {
        acknowledged: false,
        timestamp: undefined,
        rawTrans: {
          id: uuidv4(),
          trans: insertOrDeleteTrans
        }
      }
    },
    closeFile() {
      this.clearFileId()
      this.setFileName('untitled.adoc')
      this.setContent(DEFAULT_TEXT)
      this.saveState = 'Saved Locally'
    },
    setFileId(fileId: string) {
      this.fileId = fileId
      localStorage.setItem(constants.localStorageFileIdKey, fileId)
    },
    clearFileId() {
      this.fileId = undefined
      localStorage.removeItem(constants.localStorageFileIdKey)
    },
    setFileName(fileName: string) {
      this.fileName = fileName
      localStorage.setItem(constants.localStorageFileNameKey, fileName)
    },
    setContent(content: string) {
      this.content = content
      localStorage.setItem(constants.localStorageTextKey, content)
    },
    clearOTTransStack() {
      this.otTransStack = []
    }
  },
})
