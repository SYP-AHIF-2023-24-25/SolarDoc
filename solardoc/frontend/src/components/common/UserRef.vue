<script setup lang="ts">
import PaddedInfoBox from '@/components/common/PaddedInfoBox.vue'

defineProps<{ userName: string; id: string }>()
</script>

<template>
  <span class="user-ref">
    <code>{{ userName }}</code>
    <PaddedInfoBox :infoText="id" />
  </span>
</template>

<style scoped lang="scss">
.user-ref {
  code {
    padding: 0 0 0 0.5rem;
    margin: 0;
  }
}
</style>
