<script setup lang="ts">
import InfoBox from '@/components/common/InfoBox.vue'

defineProps<{ infoText: any; top?: number }>()
</script>

<template>
  <span :class="'padded-info-box ' + (top ? 'custom-top' : '')" :style="`top: ${top}px;`">
    <InfoBox :infoText="infoText" />
  </span>
</template>

<style scoped lang="scss">
.padded-info-box {
  margin-left: 0.25rem;

  &.custom-top {
    position: relative;
  }
}
</style>
