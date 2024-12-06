<script setup lang="ts">
import PaddedInfoBox from '@/components/common/PaddedInfoBox.vue'

defineProps<{ userName: string; id: string, noPadding?: boolean, top?: number }>()
</script>

<template>
  <span
    :class="'user-ref ' + (noPadding ? 'no-padding ' : '')"
  >
    <code>{{ userName }}</code>
    <PaddedInfoBox :infoText="id" :top="top"/>
  </span>
</template>

<style scoped lang="scss">
.user-ref {
  code {
    padding: 0 0 0 0.5rem;
    margin: 0;
  }

  &.no-padding {
    &,
    & code {
      padding: 0 !important;
    }
  }
}
</style>
