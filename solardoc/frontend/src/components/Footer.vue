<script setup lang="ts">
import constants from "@/plugins/constants";
</script>

<template>
  <div id="footer">
    <p>{{ constants.copyright }}</p>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/var' as var;

#footer {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 10rem;
  margin: 0;
  padding: 0;

  &, p {
    color: white;
  }

  // We want a very gentle but cool looking gradient which is slightly tilted (only slightly visible)
  background: linear-gradient(135deg, var.$scheme-footer-black-primary, var.$scheme-footer-black-secondary);
}
</style>
