<script lang="ts" setup>
import * as phoenixBackend from '@/services/phoenix/api-service'
import { useRouter } from 'vue-router'
import { useCurrentUserStore } from '@/stores/current-user'
import type { Vueform } from '@vueform/vueform'
import {
  type ActualPhxErrorResp,
  PhoenixBadRequestError,
  PhoenixInvalidCredentialsError,
} from '@/services/phoenix/errors'
import { SolardocUnreachableError } from '@/errors/unreachable-error'
import { interceptErrors } from '@/errors/handler/error-handler'
import { isValidPath } from '@/scripts/is-valid-path'
import { useLoadingStore } from '@/stores/loading'

const $router = useRouter()
const currentUserStore = useCurrentUserStore()
const loadingStore = useLoadingStore()

currentUserStore.fetchCurrentUserIfNotFetchedAndAuthValid()

// Ensure if the user is already logged in that he is redirected to the '/profile' page
if (currentUserStore.loggedIn) {
  redirect()
}

async function redirect() {
  loadingStore.setLoading(true)

  const returnTo = $router.currentRoute.value.query.returnTo
  if (typeof returnTo === 'string' && isValidPath(returnTo)) {
    return await $router.push(returnTo)
  } else {
    return await $router.push('/profile')
  }
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
    console.error('[Login] Encountered network error during login', e)
    throw new SolardocUnreachableError('Encountered network error during login')
  }

  if (resp.status === 201) {
    console.log('[Login] Login successful. Redirecting to profile page')
    currentUserStore.setCurrentAuth(resp.data)

    await currentUserStore.fetchCurrentUser()
    await redirect()
  } else if (resp.status === 400) {
    throw new PhoenixBadRequestError('Server rejected sign in', resp.data as ActualPhxErrorResp)
  } else if (resp.status === 401) {
    throw new PhoenixInvalidCredentialsError()
  } else {
    console.error('[Login] Server rejected sign in. Cause: Unknown error', resp)
    throw new SolardocUnreachableError(
      'Server rejected sign in.',
      'Unknown error. Please try again.',
    )
  }
}
</script>

<template>
  <div id="profile-wrapper" class="page-content-wrapper">
    <div id="profile-container" class="page-content-container">
      <div id="do-not-have-an-account">
        <p>Don't have an account yet?</p>
        <RouterLink class="emphasised-link" to="/signup">→ Sign up</RouterLink>
      </div>
      <h1 id="login-signup-title">Log in</h1>
      <Vueform
        ref="form$"
        :display-errors="false"
        :endpoint="false"
        add-class="solardoc-style-form"
        @submit="(value: any) => interceptErrors(submitForm(value))"
      >
        <TextElement :rules="['required', 'email']" label="Email" name="email" />
        <TextElement
          :rules="['required', 'min:0']"
          input-type="password"
          label="Password"
          name="password"
        />
        <ButtonElement
          :columns="{
            container: 2,
          }"
          :submits="true"
          button-label="Login"
          name="login"
          @submit="submitForm"
        />
        <ButtonElement
          :columns="{
            container: 2,
          }"
          :resets="true"
          :secondary="true"
          align="center"
          button-label="Reset"
          name="reset"
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

<style lang="scss" scoped>
@use '@/assets/core/var' as var;
@use '@/assets/page-content' as *;
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
