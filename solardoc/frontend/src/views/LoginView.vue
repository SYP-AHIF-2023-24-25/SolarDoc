<script setup lang="ts">
import * as phoenixBackend from '@/services/phoenix/api-service'
import { useRouter } from 'vue-router'
import { useCurrentUserStore } from '@/stores/current-user'
import type { Vueform } from '@vueform/vueform'

const $router = useRouter()
const currentUserStore = useCurrentUserStore()

currentUserStore.fetchCurrentUserIfNotFetchedAndAuthValid()

// Ensure if the user is already logged in that he is redirected to the '/profile' page
if (currentUserStore.loggedIn) {
  $router.push('/profile')
}

async function submitForm(
  form$: Vueform & {
    requestData: {
      email: string
      password: string
    }
  },
) {
  if (!form$?.requestData) {
    return
  }

  const loginUser = {
    email: form$.requestData.email,
    password: form$.requestData.password,
  } satisfies phoenixBackend.UserLogin

  let resp: Awaited<ReturnType<typeof phoenixBackend.postV1AuthBearer>>
  try {
    resp = await phoenixBackend.postV1AuthBearer(loginUser)
  } catch (e) {
    console.error('[Login] Signup rejected by backend. Cause: ' + e)
    return
  }

  if (resp.status === 201) {
    console.log('[Login] Login successful. Redirecting to profile page')
    currentUserStore.setCurrentAuth(resp.data)

    await currentUserStore.fetchCurrentUser()
    await $router.push('/profile')
  } else if (resp.status === 401) {
    console.error('Server rejected sign up. Cause: Unauthorized')
  } else if (resp.status === 400) {
    console.error('Server rejected sign up. Cause: Bad request')
  } else {
    console.error('Server rejected sign up. Cause: Unknown error', resp)
  }
}
</script>

<template>
  <div id="profile-wrapper" class="page-form-wrapper">
    <div id="profile-container" class="page-form-container">
      <div id="do-not-have-an-account">
        <p>Don't have an account yet?</p>
        <RouterLink class="emphasised-link" to="/signup">→ Sign up</RouterLink>
      </div>
      <h1 id="login-signup-title">Log in</h1>
      <Vueform
        ref="form$"
        add-class="solardoc-style-form"
        :display-errors="false"
        :endpoint="false"
        @submit="submitForm"
      >
        <TextElement name="email" label="Email" :rules="['required', 'email']" />
        <TextElement
          name="password"
          input-type="password"
          label="Password"
          :rules="['required', 'min:0']"
        />
        <ButtonElement
          name="login"
          button-label="Login"
          @submit="submitForm"
          :columns="{
            container: 2,
          }"
          :submits="true"
        />
        <ButtonElement
          name="reset"
          button-label="Reset"
          :secondary="true"
          :resets="true"
          :columns="{
            container: 2,
          }"
          align="center"
        />
        <div id="forgot-my-password">
          <a class="emphasised-link" @click="$router.push('reset-password')"
            >Forgot your password?</a
          >
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
    width: 100%;
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
