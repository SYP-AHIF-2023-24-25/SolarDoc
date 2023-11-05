<script setup lang="ts">

</script>

<template>
  <nav id="navbar">
    <div id="left-components">
      <img alt="SolarDoc logo" src="@/assets/logo.svg" width="50" height="50" />
      <div id="title">
        <p @click="$router.push('/')">SolarDoc</p>
      </div>
    </div>
    <div id="navigation-links">
      <div id="router-links">
        <RouterLink to="/docs">docs</RouterLink>
        <RouterLink to="/editor">editor</RouterLink>
        <RouterLink to="/about">about</RouterLink>
      </div>
      <div id="right-components">
        <img alt="Github Icon" src="@/assets/github-logo.svg" />
        <img alt="Moon Icon" src="@/assets/moon.svg" />
      </div>
    </div>
  </nav>
</template>

<style scoped lang="scss">
@import "@/assets/core/var";

#navbar {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  padding: 0 1rem;

  #title {
    display: flex;
    align-items: center;
    font-size: 2rem;
    margin: 0 0 0 0.2rem;

    p {
      &:hover {
        cursor: pointer;
        color: var(--scheme-cs-2);
      }
    }
  }

  #left-components {
    display: flex;
  }

  #navigation-links {
    margin-top: 0.5rem;
    display: flex;
    gap: 1rem;

    #router-links {
      width: 30rem;
      display: flex;
      justify-content: space-between;

      & > * {
        text-decoration: none;
        color: black;
        font-size: 1.5rem;

        &:hover {
          color: $scheme-cs-2;
        }
      }
    }

    #right-components {
      display: flex;

      & > * {
        width: 30px;
        height: 30px;
      }
    }
  }
}
</style>
