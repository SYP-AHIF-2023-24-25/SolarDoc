<template>
  <nav class="navbar">
    <div class="left-components">
      <img alt="SolarDoc logo" src="@/assets/logo.svg" width="50" height="50" />
      <p class="title">SolarDoc</p>
    </div>
    <div class="navigation-links">
      <div class="router-links">
        <RouterLink to="/docs">docs</RouterLink>
        <RouterLink to="/editor">editor</RouterLink>
        <RouterLink to="/about">about</RouterLink>
      </div>
      <div class="right-components">
        <img alt="Github Icon" src="@/assets/github-logo.svg" />
        <img alt="Moon Icon" src="../assets/moon.svg" />
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  flex-flow: row nowrap;
  /*background-color: #4990e2;*/
  justify-content: space-between;
}
.title {
  font-size: 2rem;
  margin: 0.2rem 0 0 0.2rem;
}

.left-components {
  display: flex;
}

.right-components {
  display: flex;
  & > * {
    width: 30px;
    height: 30px;
  }
}

.router-links {
  display: flex;
  & > * {
    text-decoration: none;
    color: black;
    font-size: 1.5rem;
  }
}

.navigation-links {
  margin-top: 0.5rem;
  display: flex;
}
</style>
<script setup lang="ts"></script>
