<script setup lang="ts">
import {ref} from "vue";
import Editor from '@/components/editor/Editor.vue'
import SandwichMenuSVG from '@/components/icons/SandwichMenuSVG.vue'
import SandwichMenuDarkModeSVG from '@/components/icons/SandwichMenuDarkModeSVG.vue'
import { useDarkModeStore } from '@/stores/dark-mode'
import {useEditorContentStore} from "@/stores/editor-content";
import type { SubscriptionCallbackMutation} from "pinia";
import {usePreviewLoadingStore} from "@/stores/preview-loading";
import * as backendAPI from '@/services/backend/api-service';
import type {
  RenderedPresentationRjsHtmlDtoModel,
  RenderPresentationRjsHtmlDtoModel
} from "@/services/backend/api-service";
import {useInitStateStore} from "@/stores/init-state";

const darkModeStore = useDarkModeStore()
const editorContentStore = useEditorContentStore()
const previewLoadingStore = usePreviewLoadingStore()
const initStateStore = useInitStateStore()

// Default filename is sample-presentation.adoc
const fileName = ref('sample-presentation.adoc')

// The download URL where the preview is available
const previewUrl = ref('')

// The reveal.js CDN URL which provides the reveal.js assets
const REVEAL_JS_CDN_URL = 'https://cdn.jsdelivr.net/npm/reveal.js@5.0.2/'

// Ensure the backend is running and reachable
// TODO! Implement proper popup in case of error
backendAPI.checkIfBackendIsReachable()
  .then(void 0)
  .catch((error: Error) => {
    if (error) {
      console.error(error)
    }
    console.error('Backend is not reachable. Please copy the logs and contact the developers.')
  })

// Ensure the render preview is updated whenever the editor content changes
editorContentStore.$subscribe(async (
  mutation: SubscriptionCallbackMutation<{ editorContent: string }>,
  state: { editorContent: string },
) => {
  const { editorContent } = state
  const renderPresentationDtoModel: RenderPresentationRjsHtmlDtoModel = {
    fileName: fileName.value,
    fileContent: editorContent,
    revealJSAssetsPath: REVEAL_JS_CDN_URL,
  }

  // Send a render request to the backend
  let renderRespObj: RenderedPresentationRjsHtmlDtoModel;
  const renderResp = await backendAPI.postV1RenderPresentationRjsHtml(renderPresentationDtoModel)
  if (renderResp.status === 200) {
    renderRespObj = renderResp.data
  } else {
    throw new Error(`[EditorView] Failed to execute render presentation request:\n${renderResp}`)
  }

  // Update the preview URL
  previewUrl.value = renderRespObj.download.downloadURL

  previewLoadingStore.setPreviewLoading(false)
})
</script>

<template>
  <div id="editor-page">
    <div id="menu">
      <div id="menu-left-side">
        <button id="sandwich-menu-button" class="sandwich-button">
          <SandwichMenuDarkModeSVG v-show="darkModeStore.darkMode" />
          <SandwichMenuSVG v-show="!darkModeStore.darkMode" />
        </button>
        <div id="button-menu">
          <button class="editor-button">Copy</button>
          <button class="editor-button">Share</button>
          <button class="editor-button">Download</button>
        </div>
      </div>
      <div id="menu-center">
        <div>
          <label for="file-name-input"></label>
          <input id="file-name-input" v-model="fileName"/>
        </div>
      </div>
      <div id="menu-right-side">
        <div>
          <p>Last edited: 20:08 14-10-2023 CET</p>
        </div>
      </div>
    </div>
    <div id="editor-and-preview-wrapper">
      <div id="editor-wrapper">
        <Editor></Editor>
      </div>
      <div id="preview-wrapper">
        <div id="preview">
          <h2 v-if="initStateStore.init">Start typing and see preview!</h2>
          <h2 v-else-if="previewLoadingStore.previewLoading && !initStateStore.init"><span class="dot-flashing"></span></h2>
          <iframe v-else :src="previewUrl"></iframe>
        </div>
        <div id="preview-meta-info">
          <p>3 slides</p>
          <p>1.2 MB Raw Size</p>
        </div>
        <div id="slides-navigator">
          <p>Slides Navigator</p>
        </div>
        <div id="sub-slides-navigator">
          <p>Sub Slides Navigator</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/mixins/link-hover-presets' as *;
@use '@/assets/core/mixins/view-presets' as *;
@use '@/assets/core/mixins/align-center' as *;
@use '@/assets/core/var' as var;

$left-menu-width: calc(40vw - 0.5rem);
$center-menu-width: 20vw;
$right-menu-width: calc(40vw - 0.5rem);

@mixin menu-child-presets {
  display: flex;
  margin: 0;
  padding: 0;
}

div#editor-page {
  @include view-presets;

  #menu {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    padding: var.$editor-menu-padding;
    margin: var.$editor-menu-margin;
    height: 2rem;

    #menu-left-side {
      @include menu-child-presets;
      width: $left-menu-width;

      #sandwich-menu-button {
        // TODO!
      }

      #button-menu {
        display: flex;
        flex-flow: row nowrap;
        padding: var.$editor-menu-button-menu-padding;
        margin: var.$editor-menu-button-menu-margin;
      }
    }

    #menu-center {
      @include menu-child-presets;
      width: $center-menu-width;
      justify-content: center;
      align-content: center;

      div {
        @include align-center;

        #file-name-input {
          border: none;
          background-color: transparent;
          text-align: center;
          width: 100%;
          height: calc(100% - 2px);
          padding: 0;
          margin: 0;

          &:focus {
            outline: var.$scheme-cs-1 solid 2px;
            border-radius: 2px;
          }
        }
      }
    }

    #menu-right-side {
      @include menu-child-presets;
      width: $right-menu-width;
      justify-content: flex-end;

      div {
        @include align-center;
      }
    }
  }

  #editor-and-preview-wrapper {
    display: flex;
    flex-flow: row nowrap;
    border-top: var.$editor-border;

    #editor {
      display: flex;
      flex-flow: column nowrap;
      width: var.$editor-monaco-width;
      height: var.$editor-monaco-height;
      padding-top: var.$editor-monaco-padding-top;
    }

    #editor-wrapper {
      border-right: var.$editor-border;
    }

    #preview-wrapper {
      display: flex;
      flex-direction: column;
      flex-grow: 1;

      #preview {
        @include align-center();
        margin: 0;
        padding: 0;
      }

      #preview-meta-info {
        @include align-center();
        flex-flow: row nowrap;
        height: var.$editor-preview-meta-info-height;
        padding: var.$editor-preview-meta-info-padding;
        border-bottom: var.$editor-border;
        justify-content: space-between;
      }

      #slides-navigator {
        @include align-center();
        height: var.$editor-preview-slides-navigator-height;
        padding: var.$editor-preview-slides-navigator-padding;
        border-bottom: var.$editor-border;
      }

      #sub-slides-navigator {
        @include align-center();
        flex-grow: 1;
      }

      #preview {
        @include align-center();
        border-bottom: var.$editor-border;
        width: var.$editor-preview-frame-width;
        height: var.$editor-preview-frame-height;

        iframe {
          border: none;
          width: 100%;
          height: 100%;
        }
      }
    }
  }
}
</style>
