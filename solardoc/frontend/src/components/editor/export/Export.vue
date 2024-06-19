<script setup lang="ts">

import {useOverlayStateStore} from "@/stores/overlay-state";
import CloseButtonSVG from "@/components/icons/CloseButtonSVG.vue";
import {useCurrentFileStore} from "@/stores/current-file";
import {handleRender} from "@/scripts/handle-render";


const overlayStateStore = useOverlayStateStore()
const currentFileStore = useCurrentFileStore()
let selectedFormat = "HTML"

async function handleFileExport() {
  let resp = await handleRender(currentFileStore.fileName,currentFileStore.content);
  let content = await fetch(resp.previewURL)
  let value = await content.blob();
  let fileType = "text/html"



    let a = document.createElement('a')
    a.download = `${currentFileStore.fileName.substring(0,currentFileStore.fileName.length-4)}${selectedFormat.toLowerCase()}`
    a.href = URL.createObjectURL(value)
    a.dataset.downloadurl = [fileType, resp.previewURL, a.href].join(':')
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(function () {
      URL.revokeObjectURL(a.href)
    }, 1500)

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
        <span>Currently there is only HTML export available</span>
      </div>
        <Vueform>
          <SelectElement disabled
              name="select"
              v-model="selectedFormat"
              :native="false"
              :items="[
        'HTML',
        'PDF',
        'JPG',
        'PNG',
      ]"
          />
        </Vueform>
        <button id="export-button" class="highlighted-button" @click="handleFileExport()">Export</button>
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

  #export-view{
    position: relative;
    flex: 0 1 auto;
    height: max-content;
    border-radius: 1rem;
    padding: 0.5rem 2rem;
    background-color: var.$overlay-background-color;
    box-shadow: 0 0 10px 0 var.$box-shadow-color;

    // Adjust size depending on the screen width
    width: 90vw;

    @media screen and (min-width: var.$window-medium) {
      & {
        width: 60vw;
      }
    }

    @media screen and (min-width: var.$window-xlarge) {
      & {
        width: 50vw;
      }
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