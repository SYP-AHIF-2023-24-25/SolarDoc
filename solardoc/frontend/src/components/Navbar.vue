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
import SDRouterLink from '@/components/common/SDRouterLink.vue'
import { useDarkModeStore } from '@/stores/dark-mode'
import SandwichMenuDarkModeSVG from '@/components/icons/SandwichMenuDarkModeSVG.vue'
import SandwichMenuSVG from '@/components/icons/SandwichMenuSVG.vue'

const darkModeStore = useDarkModeStore()
</script>

<template>
  <nav class="navbar desktop">
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
  <nav class="navbar phone">
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
      <button id="sandwich-menu-button" class="sandwich-button">
        <SandwichMenuDarkModeSVG v-show="darkModeStore.darkMode" />
        <SandwichMenuSVG v-show="!darkModeStore.darkMode" />
      </button>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
@use '@/assets/core/mixins/link-hover-presets' as *;
@use '@/assets/core/mixins/align-horizontal-center' as *;
@use '@/assets/core/mixins/screen-size' as *;
@use '@/assets/core/mixins/hide' as *;
@use '@/assets/core/var' as var;

/* General styling for the navbar */
.navbar {
  #left-components {
    @include align-horizontal-center;

    #title {
      @include align-horizontal-center;
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

        &:hover {
          @include link-hover-presets;
        }
      }
    }
  }
}

.navbar.desktop {
  @include hide-that-respects-svg;
}

/* Window size is small - small tablet or smaller */
.navbar.phone {
  @include show-that-respects-svg;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  height: var.$nav-bar-height;
  width: var.$nav-bar-width;
  padding: var.$nav-bar-phone-padding;
  margin: var.$nav-bar-phone-margin;
  gap: 2rem;

  #left-components {
    #solardoc-logo {
      svg {
        width: 2.5rem;
        height: 2.5rem;
      }
    }

    #title {
      font-size: 1.5rem;
    }

    #version-tag {
      font-size: 0.9rem;
    }
  }

  #right-components {
    height: var.$nav-bar-height;
    width: var.$nav-bar-height;

    #sandwich-menu-button {
      height: var.$nav-bar-height;
      width: var.$nav-bar-height;

      svg {
        width: 1.5rem;
        height: 1.5rem;
      }
    }
  }
}

/* Window size is medium or larger */
@include r-min(var.$window-medium) {
  .navbar:not(.phone) {
    @include show-that-respects-svg;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    height: var.$nav-bar-height;
    width: var.$nav-bar-width;
    padding: var.$nav-bar-padding;
    margin: var.$nav-bar-margin;
    gap: 2rem;

    #left-components {
      #solardoc-logo {
        svg {
          width: 50px;
          height: 50px;
        }
      }

      #title {
        font-size: 2rem;
      }

      #version-tag {
        font-size: 0.9rem;
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
          display: flex;
          justify-content: space-between;
          width: 30vw;
          max-width: 20rem;

          @include r-min(var.$window-large) {
            width: 40vw;
          }

          @include r-min(var.$window-xlarge) {
            width: 20rem;
            max-width: 20rem;
          }

          & > * {
            text-decoration: none;
            font-size: 1.5rem;

            // Add a nice fading box shadow with the text-color

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

  .navbar.phone {
    @include hide-that-respects-svg;
  }
}
</style>
