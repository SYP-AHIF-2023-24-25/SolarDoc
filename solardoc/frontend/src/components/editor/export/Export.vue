<script setup lang="ts">
import { ref, computed } from "vue";
import JSZip from "jszip";
import { useOverlayStateStore } from "@/stores/overlay-state";
import CloseButtonSVG from "@/components/icons/CloseButtonSVG.vue";
import { useCurrentFileStore } from "@/stores/current-file";
import { handleRender } from "@/scripts/handle-render";
import { postV1RenderPresentationImages, postV1RenderPresentationPdf } from "@/services/render/gen/backend-rest-service";
import { RenderBackendRestError } from "@/services/render/errors";

const overlayStateStore = useOverlayStateStore();
const currentFileStore = useCurrentFileStore();

const selectedFormats = ref<string[]>([]);

function toggleFormat(format: string) {
  if (selectedFormats.value.includes(format)) {
    selectedFormats.value = selectedFormats.value.filter(item => item !== format);
  } else {
    selectedFormats.value.push(format);
  }
}

const isFormatSelected = computed(() => selectedFormats.value.length > 0);

async function handleFileExport() {
  for (const format of selectedFormats.value) {
    let resp, previewURL;
    let presentationModel = {
      fileContent: currentFileStore.content,
      fileName: currentFileStore.fileName,
    };

    try {
      switch (format.toUpperCase()) {
        case "PDF":
          resp = await postV1RenderPresentationPdf(presentationModel);
          previewURL = resp.data.download?.downloadURL;
          break;
        case "HTML":
          resp = await handleRender(currentFileStore.fileName, currentFileStore.content);
          previewURL = resp.previewURL;
          break;
        case "ADOC":
          previewURL = `data:text/asciidoc,${encodeURIComponent(currentFileStore.content)}`;
          break;
        case "JPG":
          resp = await postV1RenderPresentationImages(presentationModel);
          previewURL = resp.data.download?.downloadURL;
          break;
        default:
          console.warn(`Unsupported format: ${format}`);
          continue;
      }

      const content = await fetch(previewURL);
      const value = await content.blob();
      const extension = format.toLowerCase();
      const fileName = `${currentFileStore.fileName.replace(/\.[^/.]+$/, "")}.${extension}`;

      const a = document.createElement('a');
      a.download = fileName;
      a.href = URL.createObjectURL(value);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error("Error in file export:", e);
      throw new RenderBackendRestError(
          'Failed to render file. Cause: ' + (<Error>e).message,
      );
    }
  }
}

async function handleFileExportAsZip() {
  const zip = new JSZip();
  const promises = [];

  for (const format of selectedFormats.value) {
    let resp, previewURL;
    let presentationModel = {
      fileContent: currentFileStore.content,
      fileName: currentFileStore.fileName,
    };

    try {
      switch (format.toUpperCase()) {
        case "PDF":
          resp = await postV1RenderPresentationPdf(presentationModel);
          previewURL = resp.data.download?.downloadURL;
          break;
        case "HTML":
          resp = await handleRender(currentFileStore.fileName, currentFileStore.content);
          previewURL = resp.previewURL;
          break;
        case "ADOC":
          previewURL = `data:text/plain,${encodeURIComponent(currentFileStore.content)}`;
          break;
        case "JPG":
          resp = await postV1RenderPresentationImages(presentationModel);
          previewURL = resp.data.download?.downloadURL;
          break;
        default:
          console.warn(`Unsupported format: ${format}`);
          continue;
      }

      const content = await fetch(previewURL);
      const value = await content.blob();
      const extension = format.toLowerCase();
      const fileName = `${currentFileStore.fileName.replace(/\.[^/.]+$/, "")}.${extension}`;

      promises.push(zip.folder("exports").file(fileName, value));
    } catch (e) {
      console.error("Error in file export:", e);
      throw new RenderBackendRestError(
          'Failed to render file. Cause: ' + (<Error>e).message,
      );
    }
  }

  Promise.all(promises).then(() => {
    zip.generateAsync({ type: "blob" }).then((content) => {
      const zipFileName = `${currentFileStore.fileName.replace(/\.[^/.]+$/, "")}.zip`;
      const a = document.createElement('a');
      a.download = zipFileName;
      a.href = URL.createObjectURL(content);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(a.href), 1500);
    });
  });
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
      <div class="solardoc-style-form">
        <div class="format-selection">
          <div class="format-box"
               :class="{ selected: selectedFormats.includes('HTML') }"
               @click="toggleFormat('HTML')">
            <span>HTML</span>
          </div>
          <div class="format-box"
               :class="{ selected: selectedFormats.includes('PDF') }"
               @click="toggleFormat('PDF')"
          >
            <span>PDF</span>
          </div>
          <div class="format-box"
               :class="{ selected: selectedFormats.includes('JPG') }"
               @click="toggleFormat('JPG')">
            <span>JPG</span>
          </div>
          <div class="format-box"
               :class="{ selected: selectedFormats.includes('ADOC') }"
               @click="toggleFormat('ADOC')">
            <span>AsciiDoc</span>
          </div>
        </div>

        <button id="export-button" class="highlighted-button" @click="handleFileExport" :disabled="!isFormatSelected">Export</button>
        <button id="zip-button" class="highlighted-button" @click="handleFileExportAsZip" :disabled="!isFormatSelected">Export as Zip</button>
      </div>
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

  #export-button, #zip-button {
    margin: 0.5rem 2rem;
  }

  .format-selection {
    display: flex;
    justify-content: space-around;
    margin: 1rem 0;
  }

  .format-box {
    flex: 1;
    margin: 0 1rem;
    padding: 1rem;
    text-align: center;
    border-radius: 0.5rem;
    color: black;
    background-color: #f0f0f0;
    cursor: pointer;
    transition: background-color 0.3s;

    &.selected {
      background-color: var.$stylised-button-text-color;
    }

    &:hover {
      cursor: pointer;
      color: white;
      background-color: var.$stylised-button-text-color;
    }

    &:disabled {
      color: var.$stylised-button-disabled-color;
      border: 2px solid var.$stylised-button-disabled-color;
      background-color: transparent;
      cursor: not-allowed;

    }
  }
}
</style>
