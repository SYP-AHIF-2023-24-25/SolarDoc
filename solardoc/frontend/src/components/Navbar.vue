<script lang="ts" setup>
import HalfMoonSVG from '@/components/icons/HalfMoonSVG.vue'
import GithubLogoSVG from '@/components/icons/GithubLogoSVG.vue'
import SolardocLogoSVG from '@/components/icons/SolardocLogoSVG.vue'
import GithubLogoDarkModeSVG from '@/components/icons/GithubLogoDarkModeSVG.vue'
import SolardocLogoDarkModeSVG from '@/components/icons/SolardocLogoDarkModeSVG.vue'
import SunDarkModeSVG from '@/components/icons/SunDarkModeSVG.vue'
import constants from '@/plugins/constants'
import UserIconDarkModeSVG from '@/components/icons/UserIconDarkModeSVG.vue'
import UserIconSVG from '@/components/icons/UserIconSVG.vue'
import SDRouterLink from '@/components/SDRouterLink.vue'
import { useDarkModeStore } from '@/stores/dark-mode'

const darkModeStore = useDarkModeStore()
</script>

<template>
  <nav id="navbar">
    <div id="left-components">
      <div id="solardoc-logo">
        <SolardocLogoDarkModeSVG v-show="darkModeStore.darkMode" />
        <SolardocLogoSVG v-show="!darkModeStore.darkMode" />
      </div>
      <div id="title">
        <SDRouterLink to="/">SolarDoc</SDRouterLink>
        <a id="version-tag" :href="`${constants.githubVersionURL}/${constants.version}`">{{
          constants.version
        }}</a>
      </div>
    </div>
    <div id="right-components">
      <div id="navigation-links">
        <div id="router-links">
          <SDRouterLink to="/docs">docs</SDRouterLink>
          <SDRouterLink to="/editor">editor</SDRouterLink>
          <SDRouterLink to="/collab">collab</SDRouterLink>
        </div>
      </div>
      <div id="clickable-icons">
        <SDRouterLink to="/login">
          <UserIconDarkModeSVG v-show="darkModeStore.darkMode" />
          <UserIconSVG v-show="!darkModeStore.darkMode" />
        </SDRouterLink>
        <a :href="constants.githubURL" rel="noopener noreferrer" target="_blank">
          <GithubLogoDarkModeSVG v-show="darkModeStore.darkMode" />
          <GithubLogoSVG v-show="!darkModeStore.darkMode" />
        </a>
        <a @click="darkModeStore.toggleDarkMode()">
          <SunDarkModeSVG v-show="darkModeStore.darkMode" />
          <HalfMoonSVG v-show="!darkModeStore.darkMode" />
        </a>
      </div>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
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

      * {
        text-decoration: none;

        &:hover {
          @include link-hover-presets;
        }
      }

      #version-tag {
        position: relative;
        right: -4px;
        top: -0.5rem;
        font-size: 1rem;

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

        @media screen and (max-width: var.$window-xlarge) {
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

      & > *,
      & > * > * {
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
