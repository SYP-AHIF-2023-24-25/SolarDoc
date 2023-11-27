<script setup lang="ts">
import HalfMoonSVG from "@/components/icons/HalfMoonSVG.vue";
import GithubLogoSVG from "@/components/icons/GithubLogoSVG.vue";
import SolardocLogoSVG from "@/components/icons/SolardocLogoSVG.vue";
import Constants from "@/plugins/Constants";

function toggleDarkMode(): void {
  const html = document.querySelector("html") as HTMLElement;

  /* Dark mode is specified by the 'data-theme' attribute on the <html> tag. */
  if (html.dataset.theme === "dark") {
    html.dataset.theme = "light";
  } else {
    html.dataset.theme = "dark";
  }
}
</script>

<template>
  <nav id="navbar">
    <div id="left-components">
      <div id="solardoc-logo">
        <SolardocLogoSVG />
      </div>
      <div id="title">
        <p @click="$router.push('/')">SolarDoc</p>
      </div>
    </div>
    <div id="right-components">
      <div id="navigation-links">
        <div id="router-links">
          <RouterLink to="/docs">docs</RouterLink>
          <RouterLink to="/editor">editor</RouterLink>
          <RouterLink to="/about">about</RouterLink>
        </div>
      </div>
      <div id="clickable-icons">
        <a :href="Constants.githubURL" target="_blank" rel="noopener noreferrer"><GithubLogoSVG /></a>
        <a @click="toggleDarkMode()"><HalfMoonSVG /></a>
      </div>
    </div>
  </nav>
</template>

<style scoped lang="scss">
@use '@/assets/core/mixins/link-hover-presets' as *;
@use '@/assets/core/mixins/align-horizontal-center' as *;
@use '@/assets/core/var' as var;

#navbar {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  height: var.$nav-bar-height;
  width: var.$nav-bar-width;
  padding: var.$nav-bar-padding;
  margin: var.$nav-bar-margin;
  gap: 2rem;

  #left-components {
    @include align-horizontal-center;

    #solardoc-logo {
      svg {
        width: 50px;
        height: 50px;
      }
    }

    #title {
      @include align-horizontal-center;
      font-size: 2rem;
      margin: 0 0 0 0.5rem;

      p {
        &:hover {
          @include link-hover-presets;
        }
      }
    }
  }

  #right-components {
    @include align-horizontal-center;
    display: flex;
    flex-flow: row nowrap;
    gap: 4rem;

    #navigation-links {
      @include align-horizontal-center;
      display: flex;
      gap: 1rem;

      #router-links {
        width: 30rem;
        display: flex;
        justify-content: space-between;

        @media screen and (max-width: var.$window-large) {
          & {
            max-width: 20rem;
            width: 40vw;
          }
        }

        & > * {
          text-decoration: none;
          font-size: 1.5rem;

          &:hover {
            @include link-hover-presets;
          }
        }
      }
    }

    #clickable-icons {
      @include align-horizontal-center;
      display: flex;
      gap: 2rem;

      & > * {
        @include link-hover-presets;

        padding: 0;
        margin: 0;
        width: 30px;
        height: 30px;
      }
    }
  }
}
</style>
