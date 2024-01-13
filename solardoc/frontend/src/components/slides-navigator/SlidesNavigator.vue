<script setup lang="ts">

</script>

<template>
<div id="slides-navigator">

</div>
</template>

<style scoped lang="scss">
@use '@/assets/core/var' as var;

#slides-navigator {
  flex-flow: column nowrap;
  height: 100%;
  width: var.$editor-preview-slides-navigator-width;

  // Scrollable content on the x-axis
  overflow-x: scroll;
}
</style>
