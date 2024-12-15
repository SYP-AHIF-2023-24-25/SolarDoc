<script setup lang="ts">
import { usePreviewLoadingStore } from '@/stores/preview-loading'
import { getHumanReadableTimeInfo } from '@/scripts/format-date'
import { useCurrentFileStore } from '@/stores/current-file'
import { ref } from 'vue'

const previewLoadingStore = usePreviewLoadingStore()
const currentFileStore = useCurrentFileStore()

// Last modified is a ref which is updated every 0.5 second to show the last modified time
let lastModified = ref(getLastModified())

function getLastModified(): string {
  return getHumanReadableTimeInfo(currentFileStore.lastModified)
}

const updateLastModified = () => (lastModified.value = getLastModified())
setInterval(updateLastModified, 500)
</script>

<template>
  <div id="last-modified">
    <p>
      Last edit:
      {{
        previewLoadingStore.previewLoading ? (updateLastModified() && false) || 'now' : lastModified
      }}
    </p>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/mixins/screen-size' as *;
@use '@/assets/core/mixins/hide' as *;
@use '@/assets/core/var' as var;

#last-modified {
  @include hide-that-respects-svg;
  height: 100%;
  color: var(--text-color);

  p {
    margin-top: 2px;
  }

  @include r-min(var.$window-xmedium) {
    @include show-that-respects-svg;
    font-size: 0.9rem;
  }

  @include r-min(var.$window-large) {
    font-size: 1rem;
  }
}
</style>
