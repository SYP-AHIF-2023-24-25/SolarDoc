<script lang="ts" setup></script>

<template>
  <div class="home-feature-card">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/core/var' as var;
@use '@/assets/core/mixins/screen-size' as *;

.home-feature-card {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  border-radius: 1rem;
  background-color: var.$overlay-background-color-subtle;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  height: 20rem;
  width: 100%;

  &:hover {
    transform: translateY(-0.25rem);
    box-shadow: 0 0 1.5rem rgba(0, 0, 0, 0.2);
  }

  @include r-min(var.$window-xmedium) {
    height: 100%;
    width: unset;
    padding: 2rem;
    max-width: 25rem;
  }
}
</style>
