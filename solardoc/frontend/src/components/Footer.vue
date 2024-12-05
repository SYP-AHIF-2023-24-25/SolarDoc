<script lang="ts" setup>
import constants from '@/plugins/constants'
</script>

<template>
  <div id="footer">
    <p>{{ constants.copyright }}</p>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/core/var' as var;

#footer {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 10rem;
  margin: 0;
  padding: 0;

  &,
  p {
    color: white;
    text-align: center;
  }

  // We want a very gentle but cool looking gradient which is slightly tilted (only slightly visible)
  background: linear-gradient(
    135deg,
    var.$scheme-footer-black-primary,
    var.$scheme-footer-black-secondary
  );
}
</style>
