<script setup lang="ts">

</script>

<template>
<div id="sub-slides-navigator">

</div>
</template>

<style scoped lang="scss">
@use '@/assets/core/var' as var;

#sub-slides-navigator {
  flex-flow: column nowrap;
  height: var.$editor-preview-sub-slides-navigator-height;
  max-height: var.$editor-preview-sub-slides-navigator-height;
  width: 100%;

  // Ensure that the content is scrollable
  overflow-y: scroll;
}
</style>
