<script lang="ts" setup>
import SolardocStreamSVG from '@/components/icons/SolardocStreamSVG.vue'
import HomeFeatureCard from '@/components/home/HomeFeatureCard.vue'
import { useLoadingStore } from '@/stores/loading'
import { useRouter } from 'vue-router'

const $router = useRouter()
const loadingStore = useLoadingStore()

async function routeWithLoading(to: string) {
  loadingStore.setLoading(true)
  await $router.push(to)
}
</script>

<template>
  <div id="home-page-wrapper" class="page-content-wrapper">
    <div id="home-page-welcome" class="heart-background scroll-container">
      <div id="text-and-buttons">
        <div id="welcome-text">
          <p>Create <br />presentations</p>
          <p class="gradient-text">your way.</p>
        </div>
        <div id="buttons-wrapper">
          <button class="home-button no-wrap-button" @click="routeWithLoading('editor')">
            Try now
          </button>
        </div>
      </div>
      <div id="stream-svg">
        <SolardocStreamSVG />
      </div>
    </div>
    <div class="scroll-container">
      <div id="home-page-welcome-content-separator">
        <h2>So what can Solardoc do?<span></span></h2>
      </div>
      <div id="home-page-content">
        <HomeFeatureCard>
          <h2>Help you collaborate in real-time with your friends and colleagues!<br/>✨</h2>
        </HomeFeatureCard>
        <HomeFeatureCard>
          <h2>Auto-previews and loads changes on the fly!<br/>✨</h2>
        </HomeFeatureCard>
        <HomeFeatureCard>
          <h2>Brings the best of Asciidoc to your browser with all the customisation you want!<br/>✨</h2>
        </HomeFeatureCard>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/core/var' as var;
@use '@/assets/gradient-text' as *;
@use '@/assets/page-content' as *;
@use '@/assets/heart-background' as *;
@use '@/assets/core/mixins/view-presets' as *;
@use '@/assets/core/mixins/screen-size' as *;
@use '@/assets/core/mixins/align-center' as *;

#home-page-wrapper {
  display: flex;
  flex-flow: column nowrap;

  padding: 0;
  @include r-min(var.$window-medium) {
    padding: 0 0 6rem 0;
  }

  /* Ensuring the welcome section doesn't take up too much space and feels appropriately spaced for smaller screens */
  #home-page-welcome,
  #home-page-welcome * {
    max-height: 20rem;
    @include r-min(var.$window-small) {
      max-height: 30rem;
    }

    @include r-min(var.$window-medium) {
      max-height: unset;
    }
  }

  #home-page-welcome {
    @include view-presets;
    display: flex;
    position: relative;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-self: flex-end;
    overflow: hidden;

    min-height: 20rem;
    padding: 0 0 0 2rem;
    @include r-min(var.$window-medium) {
      padding: 0 0 0 3rem;
      &::before {
        left: -6rem;
      }
    }

    @include r-min(var.$window-xlarge) {
      padding: 0 0 0 7.5rem;
      min-height: 30rem;
      &::before {
        left: -10.5rem;
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
          font-size: 3rem;

          @include r-min(var.$window-small) {
            font-size: 4rem;
          }

          @include r-min(var.$window-large) {
            font-size: 6rem;
          }

          @include r-min(var.$window-2xlarge) {
            font-size: 7.5rem;
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
      position: relative;
      display: flex;
      height: 100%;
      width: 100%;
      z-index: 0;
      margin: 0;

      svg {
        display: none;
        width: 0;
        height: 0;

        @include r-min(var.$window-small) {
          display: block;
          position: absolute;
          bottom: 0;
          right: 0;
          width: unset;
          height: 40vh;
          align-self: flex-end;
        }

        @include r-min(var.$window-medium) {
          height: 60vh;
        }

        @include r-min(var.$window-xlarge) {
          height: 80vh;
        }
      }
    }
  }

  h2 {
    font-size: 2rem;
  }

  #home-page-welcome-content-separator {
    @include align-center;
    width: 100%;
    height: 12rem;

    h2 {
      position: relative;
      text-align: center;
      font-size: 2rem;

      &::before {
        content: '';
        position: absolute;
        display: inline-block;
        margin: 0 5%;
        width: 90%;
        height: 3px;
        bottom: 0;
        left: 0;
        background-color: var.$text-color;
      }
    }

    @include r-min(var.$window-medium) {
      height: 16rem;
      h2 {
        font-size: 3rem;
      }
    }
  }

  #home-page-content {
    @include align-center;
    min-height: 30vw;
    width: 100%;
    gap: 4rem;
    padding: 0 2rem 4rem 2rem;
    flex-flow: column nowrap;
    background: var.$scheme-home-content-background-primary;

    h2 {
      font-size: 1.5rem;
      text-align: center;
    }

    @include r-min(var.$window-small) {
      h2 {
        font-size: 2rem;
      }
    }

    @include r-min(var.$window-xmedium) {
      & {
        height: 30rem;
        gap: max(6rem, 10vw);
        flex-flow: row wrap;
        padding: 0 4rem 4rem 4rem;
      }

      h2 {
        font-size: 2.5rem;
      }
    }
  }
}
</style>
