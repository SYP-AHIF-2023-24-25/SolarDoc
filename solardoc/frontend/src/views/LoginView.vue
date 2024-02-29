<script setup lang="ts">

</script>

<template>
  <div id="wrapper" class="page-form-wrapper">
    <div id="container" class="page-form-container">
      <div id="do-not-have-an-account">
        <p>Don't have an account yet?</p>
        <a class="emphasised-link" @click="$router.push('signup')">→ Sign up</a>
      </div>
      <h1 id="login-signup-title">Log in</h1>
      <Vueform add-class="solardoc-style-form" :display-errors="false">
        <TextElement
            name="email-or-username"
            label="Email or username"
            :rules="[
              'required',
              'min:6',
            ]"
        />
        <TextElement
            name="password"
            input-type="password"
            label="Password"
            :rules="[
              'required',
              'min:0',
            ]"
        />
        <ButtonElement
            name="login"
            button-label="Login"
            :submits="true"
            :columns="{
              container: 3,
            }"
        />
        <ButtonElement
            name="reset"
            button-label="Reset"
            :secondary="true"
            :resets="true"
            :columns="{
              container: 3,
            }"
        />
        <div id="forgot-my-password">
          <a class="emphasised-link" @click="$router.push('reset-password')">Forgot your password?</a>
        </div>
      </Vueform>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/var' as var;
@use '@/assets/page-form' as *;
@use '@/assets/core/mixins/align-horizontal-center' as *;

#wrapper {
  #container {
    display: flex;
    align-items: normal;
    justify-content: left;
  }

  #login-signup-title {
    width: 100%
  }

  h1 {
    margin-top: 0.7rem;
  }

  #forgot-my-password {
    @include align-horizontal-center;
    min-width: 10rem;
  }

  #do-not-have-an-account {
    width: 100%;
    display: flex;
    flex-flow: row nowrap;
    justify-content: right;
    align-items: end;
    gap: 0.5rem;

    p {
      margin: 0;
    }
  }
}
</style>