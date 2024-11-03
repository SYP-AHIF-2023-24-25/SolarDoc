<script setup lang="ts">
import { ref } from "vue";
import { useOverlayStateStore } from "@/stores/overlay-state";
import CloseButtonSVG from "@/components/icons/CloseButtonSVG.vue";
import { useCurrentFileStore } from "@/stores/current-file";
import { handleRender } from "@/scripts/handle-render";
import { postV1RenderPresentationImages, postV1RenderPresentationPdf } from "@/services/render/gen/backend-rest-service";
import { RenderBackendRestError } from "@/services/render/errors";

const overlayStateStore = useOverlayStateStore();
const currentFileStore = useCurrentFileStore();

const selectedFormat = ref("PDF");

async function handleFileExport() {
  let fileType;
  let resp;
  let previewURL;
  console.log("The format:", selectedFormat.value);

  let presentationModel = {
    fileContent: currentFileStore.content,
    fileName: currentFileStore.fileName,
  };

  try {
    switch (selectedFormat.value.toUpperCase()) {
      case "PDF":
        fileType = "application/pdf";
        resp = await postV1RenderPresentationPdf(presentationModel);
        previewURL = resp.data.download?.downloadURL; // Accessing downloadURL from data
        break;
      case "HTML":
      default:
        fileType = "text/html";
        resp = await handleRender(currentFileStore.fileName, currentFileStore.content);
        previewURL = resp.previewURL;
        break;
    }

    console.log("resp:",resp)

    let content = await fetch(previewURL);
    let value = await content.blob();

    let extension = selectedFormat.value.toLowerCase();
    let fileName = `${currentFileStore.fileName.replace(/\.[^/.]+$/, "")}.${extension}`;

    let a = document.createElement('a');
    a.download = fileName;
    a.href = URL.createObjectURL(value);
    a.dataset.downloadurl = [fileType, fileName, a.href].join(':');
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      URL.revokeObjectURL(a.href);
    }, 1500);
  } catch (e) {
    console.error("Error in file export:", e);
    throw new RenderBackendRestError(
        'Critically failed to render file. Cause: ' + (<Error>e).message,
    );
  }
}
</script>

<template>
  <div
      v-if="overlayStateStore.exportView"
      id="full-screen-wrapper"
      class="blurred-background-full-screen-overlay"
  >
    <div id="export-view">
      <div id="export-view-header">
        <button id="close-button" @click="overlayStateStore.setExportView(false)">
          <CloseButtonSVG />
        </button>
        <h1>Export</h1>
      </div>
      <Vueform>
        <SelectElement
            name="select"
            v-model="selectedFormat"
        :native="false"
        :items="['HTML', 'PDF', 'JPG', 'ADOC']"
        />
        <span>Selected: {{ selectedFormat }}</span>
      </Vueform>
      <button id="export-button" class="highlighted-button" @click="handleFileExport">Export</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/var' as var;
@use '@/assets/core/mixins/align-center' as *;
@use '@/assets/core/mixins/align-horizontal-center' as *;
@use '@/assets/full-screen-overlay' as *;

#full-screen-wrapper {
  @include align-center;

  #export-view {
    position: relative;
    flex: 0 1 auto;
    height: max-content;
    border-radius: 1rem;
    padding: 0.5rem 2rem;
    background-color: var.$overlay-background-color;
    box-shadow: 0 0 10px 0 var.$box-shadow-color;

    width: 90vw;

    @media screen and (min-width: var.$window-medium) {
      width: 60vw;
    }

    @media screen and (min-width: var.$window-xlarge) {
      width: 50vw;
    }

    #close-button {
      position: absolute;
      z-index: 101;
      margin: 0;
      right: 3rem;
      top: calc(0.5rem + 40px * 0.67 + 40px - 1.5rem - 4px);

      svg {
        width: 1.5rem;
        height: 1.5rem;
        fill: var.$text-color;
      }
    }

    p {
      margin-bottom: 1rem;
    }

    .solardoc-style-form {
      margin-bottom: 1rem;
    }
  }

  #export-button {
    margin-top: 1rem;
  }
}
</style>
