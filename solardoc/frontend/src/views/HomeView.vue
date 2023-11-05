<script setup lang="ts"></script>

<template>
  <main>
    <div id="text-and-buttons">
      <div id="welcome-text">
        <p>Create <br />presentations</p>
        <p>your way.</p>
      </div>
      <div class="buttons-wrapper">
        <button class="home-button" @click="$router.push('editor')">Try now</button>
        <button class="home-button transparent" @click="$router.push('docs')">Docs</button>
      </div>
    </div>
    <img class="stream-svg" alt="stream" src="@/assets/stream.svg" />
  </main>
</template>

<style scoped lang="scss">
@import '@/assets/core/var';

main {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-self: flex-end;
  width: 100vw;

  #text-and-buttons {
    z-index: 1;
    display: flex;
    flex-flow: column wrap;
    justify-content: center;

    #welcome-text {
      p {
        margin: 0;
        padding: 0;
        font-size: 6rem;

        @media screen and (max-width: $window-large) {
          & {
            font-size: 4rem;
          }
        }

        @media screen and (max-width: $window-medium) {
          & {
            font-size: 2rem;
          }
        }
      }
    }
  }

  .stream-svg {
    z-index: 0;
    height: 80vh;
    margin: 0;
    align-self: flex-end;
  }
}
</style>
