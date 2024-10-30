<script setup lang="ts">
import InfoBox from "@/components/InfoBox.vue";

defineProps<{ user_name, id }>()
</script>

<template>
  <span class="user-ref">
    <code>{{ user_name }}</code>
    <InfoBox :info_text="id" />
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
