<script setup lang="ts">
import { computed, ref } from 'vue'
import JSZip from 'jszip'
import { useOverlayStateStore } from '@/stores/overlay-state'
import CloseButtonSVG from '@/components/icons/CloseButtonSVG.vue'
import { useCurrentFileStore } from '@/stores/current-file'
import { handleRender } from '@/scripts/handle-render'
import { postV1RenderPresentationPdf } from '@/services/render/gen/backend-rest-service'
import { RenderBackendRestError } from '@/services/render/errors'
import { interceptErrors } from '@/errors/handler/error-handler'

const overlayStateStore = useOverlayStateStore()
const currentFileStore = useCurrentFileStore()

const selectedFormats = ref<string[]>([])

function toggleFormat(format: string) {
  if (selectedFormats.value.includes(format)) {
    selectedFormats.value = selectedFormats.value.filter(item => item !== format)
  } else {
    selectedFormats.value.push(format)
  }
}

const isFormatSelected = computed(() => selectedFormats.value.length > 0)

async function handleFileExport() {
  for (const format of selectedFormats.value) {
    let previewURL: string
    let presentationModel = {
      fileContent: currentFileStore.content,
      fileName: currentFileStore.fileName,
    }

    try {
      switch (format.toUpperCase()) {
        case 'PDF':
          // eslint-disable-next-line no-case-declarations
          const pdfResp = await postV1RenderPresentationPdf(presentationModel)
          previewURL = pdfResp.data.download?.downloadURL
          break
        case 'HTML':
          // eslint-disable-next-line no-case-declarations
          const htmlResp = await handleRender(currentFileStore.fileName, currentFileStore.content)
          previewURL = htmlResp.previewURL
          break
        case 'ADOC':
          previewURL = `data:text/asciidoc,${encodeURIComponent(currentFileStore.content)}`
          break
        case 'JPG':
        // const resp = await postV1RenderPresentationImages(presentationModel);
        // previewURL = resp.data.download?.downloadURL;
        // eslint-disable-next-line no-fallthrough
        default:
          console.error(`Unsupported format: ${format}`)
          return
      }

      const content = await fetch(previewURL)
      const value = await content.blob()
      const extension = format.toLowerCase()
      const fileName = `${currentFileStore.fileName.replace(/\.[^/.]+$/, '')}.${extension}`

      const a = document.createElement('a')
      a.download = fileName
      a.href = URL.createObjectURL(value)
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (e) {
      console.error('[Export.vue] Error in file export:', e)
      throw new RenderBackendRestError(
        'Failed to render file for download. Cause: ' + (<Error>e).message,
      )
    }
  }
}

async function handleFileExportAsZip() {
  let zip: JSZip = new JSZip()

  for (const format of selectedFormats.value) {
    let previewURL: string
    let presentationModel = {
      fileContent: currentFileStore.content,
      fileName: currentFileStore.fileName,
    }

    try {
      switch (format.toUpperCase()) {
        case 'PDF':
          // eslint-disable-next-line no-case-declarations
          const pdfResp = await postV1RenderPresentationPdf(presentationModel)
          previewURL = pdfResp.data.download?.downloadURL
          break
        case 'HTML':
          // eslint-disable-next-line no-case-declarations
          const htmlResp = await handleRender(currentFileStore.fileName, currentFileStore.content)
          previewURL = htmlResp.previewURL
          break
        case 'ADOC':
          previewURL = `data:text/plain,${encodeURIComponent(currentFileStore.content)}`
          break
        case 'JPG':
        // const resp = await postV1RenderPresentationImages(presentationModel);
        // previewURL = resp.data.download?.downloadURL;
        // eslint-disable-next-line no-fallthrough
        default:
          console.error(`Unsupported format: ${format}`)
          return
      }

      const content = await fetch(previewURL)
      const value = await content.blob()
      const extension = format.toLowerCase()
      const fileName = `${currentFileStore.fileName.replace(/\.[^/.]+$/, '')}.${extension}`

      const exportsFolder = zip.folder('exports')
      if (exportsFolder) {
        exportsFolder.file(fileName, value)
      } else {
        throw new Error("Failed to create 'exports' folder in zip.")
      }
    } catch (e) {
      console.error('Error in file export:', e)
      throw new RenderBackendRestError('Failed to render file. Cause: ' + (<Error>e).message)
    }
  }

  const blobData = await zip.generateAsync({ type: 'blob' })
  const zipFileName = `${currentFileStore.fileName.replace(/\.[^/.]+$/, '')}.zip`
  const a = document.createElement('a')
  a.download = zipFileName
  a.href = URL.createObjectURL(blobData)
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  setTimeout(() => URL.revokeObjectURL(a.href), 1500)
}

async function unselectOptionsAndClose() {
  selectedFormats.value = []
  overlayStateStore.setExportView(false)
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
        <button id="close-button" @click="unselectOptionsAndClose">
          <CloseButtonSVG />
        </button>
        <h1>Export</h1>
      </div>
      <div class="solardoc-style-form">
        <div class="format-selection">
          <div
            class="format-box"
            :class="{ selected: selectedFormats.includes('ADOC') }"
            @click="toggleFormat('ADOC')"
          >
            <span>AsciiDoc</span>
          </div>
          <div
            class="format-box"
            :class="{ selected: selectedFormats.includes('HTML') }"
            @click="toggleFormat('HTML')"
          >
            <span>HTML</span>
          </div>
        </div>
        <button
          id="export-button"
          class="highlighted-button"
          @click="async () => await interceptErrors(handleFileExport())"
          :disabled="!isFormatSelected"
          v-tooltip="isFormatSelected ? undefined : 'Please select at least one document type'"
        >
          Export
        </button>
        <button
          id="zip-button"
          class="highlighted-button"
          @click="async () => await interceptErrors(handleFileExportAsZip())"
          :disabled="!isFormatSelected"
          v-tooltip="isFormatSelected ? undefined : 'Please select at least one document type'"
        >
          Export as Zip
        </button>
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

  #export-button,
  #zip-button {
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
    background-color: var.$scheme-toggleable-button;
    cursor: pointer;
    transition: background-color 0.3s;
    border: 2px solid var.$scheme-toggleable-button-border;

    &,
    span {
      color: var.$text-color;
    }

    &.selected {
      background-color: var.$scheme-toggleable-button-highlighted;

      &,
      span {
        color: var.$text-color-inverted;
      }
    }

    &:hover {
      cursor: pointer;
      background-color: var.$scheme-toggleable-button-highlighted;

      &,
      span {
        color: var.$text-color-inverted;
      }
    }

    &.disabled {
      border: 2px solid var.$scheme-toggleable-button-disabled-border;
      background-color: var.$scheme-toggleable-button-disabled;
      cursor: not-allowed;

      &,
      span {
        color: var(--stylised-button-disabled-color);
      }
    }
  }
}
</style>
