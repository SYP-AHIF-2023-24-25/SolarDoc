<script setup lang="ts">
import CloseButtonSVG from '@/components/icons/CloseButtonSVG.vue'
import SDRouterLink from '@/components/common/SDRouterLink.vue'
import constants from '@/plugins/constants'
import UserIconSVG from '@/components/icons/UserIconSVG.vue'
import SunDarkModeSVG from '@/components/icons/SunDarkModeSVG.vue'
import GithubLogoDarkModeSVG from '@/components/icons/GithubLogoDarkModeSVG.vue'
import HalfMoonSVG from '@/components/icons/HalfMoonSVG.vue'
import UserIconDarkModeSVG from '@/components/icons/UserIconDarkModeSVG.vue'
import GithubLogoSVG from '@/components/icons/GithubLogoSVG.vue'
import { useDarkModeStore } from '@/stores/dark-mode'

defineProps<{ showNavbarOverlay: boolean }>()

const darkModeStore = useDarkModeStore()
</script>

<template>
  <div id="phone-navbar-overlay-background-wrapper" :class="{ active: showNavbarOverlay }">
    <div id="phone-navbar-overlay-wrapper">
      <div id="phone-navbar-overlay">
        <button id="close-button" @click="$emit('toggleNavbar', void 0)">
          <CloseButtonSVG />
        </button>
        <div id="navigation-links">
          <div id="router-links">
            <SDRouterLink to="/" @click="$emit('toggleNavbar', void 0)">home</SDRouterLink>
            <SDRouterLink to="/editor" @click="$emit('toggleNavbar', void 0)">editor</SDRouterLink>
            <SDRouterLink to="/collab" @click="$emit('toggleNavbar', void 0)">collab</SDRouterLink>
          </div>
        </div>
        <div id="clickable-icons">
          <SDRouterLink to="/login" @click="$emit('toggleNavbar', void 0)">
            <UserIconDarkModeSVG v-show="darkModeStore.darkMode" />
            <UserIconSVG v-show="!darkModeStore.darkMode" />
          </SDRouterLink>
          <a
            :href="constants.githubURL"
            rel="noopener noreferrer"
            target="_blank"
            @click="$emit('toggleNavbar', void 0)"
          >
            <GithubLogoDarkModeSVG v-show="darkModeStore.darkMode" />
            <GithubLogoSVG v-show="!darkModeStore.darkMode" />
          </a>
          <a @click="darkModeStore.toggleDarkMode()">
            <SunDarkModeSVG v-show="darkModeStore.darkMode" />
            <HalfMoonSVG v-show="!darkModeStore.darkMode" />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/mixins/link-hover-presets' as *;
@use '@/assets/core/mixins/screen-size' as *;
@use '@/assets/core/mixins/hide' as *;
@use '@/assets/core/var' as var;

#phone-navbar-overlay-background-wrapper {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000; // Make sure it's above everything else
  background-color: transparent;
  opacity: 0;
  transform: translateY(-100%);
  transition:
    opacity 0.4s ease,
    background-color 0.4s ease;

  &.active {
    opacity: 1;
    transform: translateY(0);
    background-color: rgba(0, 0, 0, 0.5);
    #phone-navbar-overlay-wrapper {
      opacity: 1;
      transform: translateY(0);
    }
  }

  #phone-navbar-overlay-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1001; // Make sure it's above everything else
    opacity: 0;
    transform: translateY(-100%);
    transition:
      opacity 0.4s ease,
      transform 0.4s ease;

    #phone-navbar-overlay {
      display: flex;
      flex-flow: column nowrap;
      position: absolute;
      width: 80vw;
      height: 80vh;
      background-color: var.$scheme-background-no-transparent;
      border-radius: 1rem;
      box-shadow: 0 0 10px 0 var.$box-shadow-color;

      @include r-min(var.$window-small) {
        width: 60vw;
        height: 60vh;
      }

      $close-button-top: calc(0.5rem + 40px * 0.67 + 40px - 1.5rem - 4px);
      $close-button-width-height: 2rem;
      $navigation-links-margin-top: calc($close-button-top + $close-button-width-height);
      $clickable-icons-margin-bottom: $navigation-links-margin-top;
      #close-button {
        position: absolute;
        z-index: 101;
        margin: 0;
        right: 3rem;
        top: $close-button-top;

        svg {
          width: $close-button-width-height;
          height: $close-button-width-height;
          fill: var.$text-color;
        }
      }

      #navigation-links {
        display: flex;
        flex-flow: column nowrap;
        justify-content: center;
        align-items: center;
        flex-grow: 3;
        margin-top: $navigation-links-margin-top;

        #router-links {
          display: flex;
          flex-flow: column nowrap;
          gap: 2rem;
          margin-top: 2rem;

          * {
            font-size: 2rem;
            text-decoration: none;
            color: var.$text-color;

            &:hover {
              @include link-hover-presets;
            }
          }
        }
      }

      #clickable-icons {
        display: flex;
        justify-content: center;
        align-items: start;
        flex-flow: row nowrap;
        gap: 2rem;
        flex-grow: 2;
        flex-shrink: 1;
        padding: 1rem;
        margin-bottom: $clickable-icons-margin-bottom;

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

    @include r-min(var.$window-medium) {
      display: none;
    }
  }
}
</style>
