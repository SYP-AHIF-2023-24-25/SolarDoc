<script lang="ts" setup>
import SolardocStreamSVG from '@/components/icons/SolardocStreamSVG.vue'
import HomeFeatureCard from '@/components/home/HomeFeatureCard.vue'
</script>

<template>
  <div id="home-page-wrapper" class="page-content-wrapper">
    <div id="home-page-welcome">
      <div id="text-and-buttons">
        <div id="welcome-text">
          <p>Create <br />presentations</p>
          <p id="gradient-text">your way.</p>
        </div>
        <div id="buttons-wrapper">
          <button class="home-button no-wrap-button" @click="$router.push('editor')">
            Try now
          </button>
          <button class="home-button no-wrap-button transparent" @click="$router.push('docs')">
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

        #gradient-text {
          color: transparent;
          background: linear-gradient(
            262deg,
            var(--scheme-cs-4),
            var(--scheme-cs-1),
            var(--scheme-cs-4),
            var(--scheme-cs-1)
          );
          background-size: 400%;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;

          -webkit-animation: moving-gradient 10s ease-in-out infinite;
          -moz-animation: moving-gradient 10s ease-in-out infinite;
          -o-animation: moving-gradient 10s ease-in-out infinite;
          animation: moving-gradient 10s ease-in-out infinite;

          &::selection {
            color: #fff;
            -webkit-text-fill-color: #fff;
          }

          @-webkit-keyframes moving-gradient {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
          @-moz-keyframes moving-gradient {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
          @-o-keyframes moving-gradient {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
          @keyframes moving-gradient {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }

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
