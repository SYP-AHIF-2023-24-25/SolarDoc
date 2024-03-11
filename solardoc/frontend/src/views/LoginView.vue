<script setup lang="ts">
import {ref} from "vue"
import * as phoenixBackend from "@/services/phoenix/api-service"
import {useRouter} from "vue-router"
import {useCurrentUserStore} from "@/stores/current-user"

const $router = useRouter()
const currentUserStore = useCurrentUserStore()

currentUserStore.fetchCurrentUserIfNotFetchedAndAuthValid()

// Ensure if the user is already logged in that he is redirected to the '/profile' page
if (currentUserStore.loggedIn) {
  $router.push("/profile")
}

const form$ = ref<{
  data: {
    email: string,
    password: string,
  }
} | null>(null)

async function submitForm() {
  if (!form$.value) {
    throw new Error("Form data is null");
  }

  const loginUser = {
    email: form$.value.data.email,
    password: form$.value.data.password,
  } satisfies phoenixBackend.UserLogin;

  let resp: Awaited<ReturnType<typeof phoenixBackend.postV1UsersAuth>>
  try {
    resp = await phoenixBackend.postV1UsersAuth(loginUser)
  } catch (e) {
    throw new Error("Signup rejected by backend. Cause: " + e)
  }
  if (resp.status === 200) {
    console.log("Login successful")
    currentUserStore.setCurrentAuth(resp.data)
  } else if (resp.status === 401) {
    throw new Error("Server rejected sign up. Cause: Unauthorized")
  } else if (resp.status === 400) {
    throw new Error("Server rejected sign up. Cause: Bad request")
  } else {
    throw new Error("Server rejected sign up. Cause: Unknown error (status: " + (resp as {status: never}).status + ")")
  }

  await currentUserStore.fetchCurrentUser()
  await $router.push("/profile")
}
</script>

<template>
  <div id="profile-wrapper" class="page-form-wrapper">
    <div id="profile-container" class="page-form-container">
      <div id="do-not-have-an-account">
        <p>Don't have an account yet?</p>
        <a class="emphasised-link" @click="$router.push('signup')">→ Sign up</a>
      </div>
      <h1 id="login-signup-title">Log in</h1>
      <Vueform ref="form$" add-class="solardoc-style-form" :display-errors="false">
        <TextElement
            name="email"
            label="Email"
            :rules="[
              'required',
              'email',
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
            @click="submitForm()"
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

#profile-wrapper {
  #profile-container {
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
