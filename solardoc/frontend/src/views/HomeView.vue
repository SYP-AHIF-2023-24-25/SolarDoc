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
    <div id="home-page-welcome">
      <div id="text-and-buttons">
        <div id="welcome-text">
          <p>Create <br />presentations</p>
          <p class="gradient-text">your way.</p>
        </div>
        <div id="buttons-wrapper">
          <button class="home-button no-wrap-button" @click="routeWithLoading('editor')">
            Try now
          </button>
          <button class="home-button no-wrap-button transparent" @click="routeWithLoading('docs')">
            Docs
          </button>
        </div>
      </div>
      <div id="stream-svg">
        <SolardocStreamSVG />
      </div>
    </div>
    <div id="home-page-welcome-content-separator">
      <h2>So what can Solardoc do?</h2>
    </div>
    <div id="home-page-content">
      <HomeFeatureCard>
        <h2>In Work! ✨</h2>
      </HomeFeatureCard>
      <HomeFeatureCard>
        <h2>In Work! ✨</h2>
      </HomeFeatureCard>
      <HomeFeatureCard>
        <h2>In Work! ✨</h2>
      </HomeFeatureCard>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/core/var' as var;
@use '@/assets/gradient-text' as *;
@use '@/assets/page-content' as *;
@use '@/assets/core/mixins/view-presets' as *;
@use '@/assets/core/mixins/screen-size' as *;
@use '@/assets/core/mixins/align-center' as *;

#home-page-wrapper {
  display: flex;
  flex-flow: column nowrap;
  padding: 0 0 6rem 0;

  #home-page-welcome {
    @include view-presets;
    display: flex;
    position: relative;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-self: flex-end;
    padding: 0 0 0 3rem;

    @include r-max(var.$window-medium) {
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

          @include r-max(var.$window-xlarge) {
            & {
              font-size: 4rem;
            }
          }

          @include r-max(var.$window-small) {
            & {
              font-size: 3rem;
            }
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
        height: 80vh;
        position: absolute;
        bottom: 0;
        right: 0;

        @include r-max(var.$window-xlarge) {
          & {
            height: 75vh;
          }
        }

        @include r-max(var.$window-medium) {
          & {
            height: 70vh;
          }
        }
        width: unset;
        align-self: flex-end;
      }
    }
  }

  h2 {
    font-size: 2rem;
  }

  #home-page-welcome-content-separator {
    @include align-center;
    width: 100%;
    height: 20rem;
    background: linear-gradient(
      0deg,
      var.$scheme-home-content-background-primary,
      var.$scheme-home-content-background-secondary
    );

    h2 {
      font-size: 3rem;
    }
  }

  #home-page-content {
    @include align-center;
    min-height: 40vw;
    width: 100%;
    gap: 4rem;
    padding: 0 2rem 4rem 2rem;
    flex-flow: column nowrap;
    background: var.$scheme-home-content-background-primary;

    @include r-min(var.$window-xmedium) {
      & {
        height: 40vw;
        gap: max(6rem, 10vw);
        flex-flow: row wrap;
        padding: 4rem;
      }
    }
  }
}
</style>
