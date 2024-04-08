import { defineStore } from 'pinia'
import constants from '@/plugins/constants'
import * as phoenixRestService from '@/services/phoenix/api-service'
import {useCurrentUserStore} from "@/stores/current-user";
import {string} from "@vueform/vueform";
import {useEditorContentStore} from "@/stores/editor-content";

export const useFileStore = defineStore('fileName', {
  state: () => {
    return {
      fileName: localStorage.getItem(constants.localStorageFileKey) || 'untitled.adoc',
      saveState: 'Saved Locally',
      file_id: '',
    }
  },
  //editor -> save_file -> fileID user-presses-save-again -> update newFile -> saveFile .... -> lisss part -> profile -> file ids-> open_file -> fileSotrage.fileId = file id
  actions: {
    async storeOnServer() {
      if(useCurrentUserStore().loggedIn){
        if(this.file_id === undefined){
          let resp = await phoenixRestService.postV1Files(<string>useCurrentUserStore().bearer, {file_name: this.fileName, content: useEditorContentStore().editorContent});
          if(resp.status === 201){
            if(resp.data.id !== undefined){
              this.file_id = resp.data.id;
            }
          }
          else{
            throw new Error("Failed to create file");
          }
        }
        else{
            let resp = await phoenixRestService.putV1FilesById(<string>useCurrentUserStore().bearer,  this.file_id, {file_name: this.fileName, content: useEditorContentStore().editorContent});
            if(resp.status !== 200){
                throw new Error("Failed to update file");
            }
        }
        this.saveState = 'Saved Remotely';
      }else{
        throw new Error("User not logged in");
      }
    },
    storeLocally() {
      localStorage.setItem(constants.localStorageFileKey, this.fileName)
    },
    setFileName(fileName: string) {
      this.fileName = fileName
      localStorage.setItem(constants.localStorageFileKey, fileName)
    },
  },
})
