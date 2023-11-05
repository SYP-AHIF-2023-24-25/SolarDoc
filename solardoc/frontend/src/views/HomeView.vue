<script setup lang="ts">

</script>

<template>
  <main>
      <div class="text-and-btns">
        <p>Create <br> presentations <br> your way.</p>
        <div class="btns">
          <button id="try-now-btn" @click="$router.push('editor')" >Try now</button>
          <button @click="$router.push('docs')" >Docs</button>
        </div>
      </div>
      <img class="adjust-img" alt="stream" src="@/assets/stream.svg"/>
  </main>
</template>

<style scoped>

p{
  font-size: 4rem;
  margin: 0 0 1rem 0;
}

.btns{
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
}

main{
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
}

.text-and-btns{
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
}

button{
  height: 2rem;
  width: 10rem;
  background-color: #4D2DB7;
  border-radius: 25%;
  cursor: pointer;
  color:white;
  border: #0E21A0;
}

.center{
  display: flex;
}

.adjust-img{
  width: 50%;
  height: 50%;
}

</style>
