<script setup lang="ts">
import InfoBox from '@/components/common/InfoBox.vue'

defineProps<{ infoText: any }>()
</script>

<template>
  <span class="padded-info-box">
    <InfoBox :infoText="infoText" />
  </span>
</template>

<style scoped lang="scss">
.padded-info-box {
  margin-left: 0.25rem;
}
</style>
