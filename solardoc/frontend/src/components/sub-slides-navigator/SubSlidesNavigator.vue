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
  height: 100%;
  width: 100%;

  // Ensure that the content is scrollable
  overflow-y: scroll;
  max-height: var.$editor-preview-sub-slides-navigator-height;
}
</style>
