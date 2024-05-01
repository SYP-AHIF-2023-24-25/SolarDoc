<script setup lang="ts">
import { ref } from "vue";
let input = ref("");

</script>

<template>
  <div id="file-searchbar and filter">
    <input type="text"  disabled v-model="input" placeholder="Search..." />
      <select disabled>
        <option value="all">All</option>
        <option value="filename">Filename</option>
        <option value="created">Created</option>
        <option value="last-edited">Last edited</option>
      </select>
  </div>

</template>

<style scoped lang="scss">

@use '@/assets/core/var' as var;
@use '@/assets/core/mixins/link-hover-presets' as *;

#file-searchbar and filter {
  display: flex;
  flex: 0 1;
  justify-content: space-evenly;
  flex-direction: row;
}



  input {
    font-size: 1.15rem;
    padding: 0.675em 6em 0.675em 1em;
    border-color: transparent;
    color: var.$text-color;
    cursor: pointer;
    background-color: var.$overlay-background-color;
  }

  input:hover {
    @include link-hover-presets-with-background;
  }

select {
  font-size: 1.15rem;
  padding: 0.675em 6em 0.675em 1em;
  border-color: transparent;
  color: var.$text-color;
  cursor: pointer;
  background-color: var.$overlay-background-color;
}

select:hover {
  @include link-hover-presets-with-background;

}

option{
  background-color: white;
  color: white;
}


input:focus {
  outline: none;
  border-color: var.$text-color;
}





</style>