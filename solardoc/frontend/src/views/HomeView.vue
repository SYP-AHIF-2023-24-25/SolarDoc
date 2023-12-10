<script setup lang="ts">
import SolardocStreamSVG from "@/components/icons/SolardocStreamSVG.vue";
</script>

<template>
  <div id="home-page">
    <div id="text-and-buttons">
      <div id="welcome-text">
        <p>Create <br />presentations</p>
        <p id="gradient-text">your way.</p>
      </div>
      <div id="buttons-wrapper">
        <button class="home-button" @click="$router.push('editor')">Try now</button>
        <button class="home-button transparent" @click="$router.push('docs')">Docs</button>
      </div>
    </div>
    <div id="stream-svg">
      <SolardocStreamSVG />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/mixins/view-presets' as *;
@use '@/assets/core/var' as var;

div#home-page {
  @include view-presets;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-self: flex-end;
  padding: 0 0 0 3rem;

  @media screen and (max-width: var.$window-medium) {
    & {
      padding: 0 0 0 2rem;
    }
  }

  #text-and-buttons {
    z-index: 1;
    display: flex;
    flex-flow: column wrap;
    justify-content: center;

    #welcome-text {
      padding-bottom: 2rem;

      p {
        margin: 0;
        padding: 0;
        font-size: 6rem;

        @media screen and (max-width: var.$window-large) {
          & {
            font-size: 4rem;
          }
        }

        @media screen and (max-width: var.$window-small) {
          & {
            font-size: 3rem;
          }
        }
      }

      #gradient-text {
        color: transparent;

        /* Here we apply a gradient which should be visible on WebKit & Moz browsers */
        background: -webkit-linear-gradient(90deg, var.$scheme-cs-1, var.$scheme-cs-2, var.$scheme-cs-3, var.$scheme-cs-4);
        background: -moz-linear-gradient(90deg, var.$scheme-cs-1, var.$scheme-cs-2, var.$scheme-cs-3, var.$scheme-cs-4);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;

        &::selection {
          color: #fff;
          -webkit-text-fill-color: #fff;
        }
      }
    }

    #buttons-wrapper {
      display: flex;
      flex-flow: row nowrap;
      gap: 1.5rem;
    }
  }

  #stream-svg {
    position: fixed;
    display: flex;
    height: 100%;
    width: 100%;
    z-index: 0;
    margin: 0;

    svg {
      height: 80vh;
      position: fixed;
      bottom: 0;
      right: 0;

      @media screen and (max-width: var.$window-large) {
        & {
          height: 75vh;
        }
      }

      @media screen and (max-width: var.$window-medium) {
        & {
          height: 70vh;
        }
      }
      width: unset;
      align-self: flex-end;
    }
  }
}
</style>
