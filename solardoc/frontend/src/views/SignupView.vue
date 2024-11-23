<script lang="ts" setup>
import type { Vueform } from '@vueform/vueform'
import * as phoenixBackend from '@/services/phoenix/api-service'
import { useCurrentUserStore } from '@/stores/current-user'
import { useRouter } from 'vue-router'
import { SolardocUnreachableError } from '@/errors/unreachable-error'
import { type ActualPhxErrorResp, PhoenixBadRequestError } from '@/services/phoenix/errors'
import { interceptErrors } from '@/errors/handler/error-handler'

const $router = useRouter()
const currentUserStore = useCurrentUserStore()

async function submitForm(
  form$: Vueform & {
    requestData: {
      email: string
      password: string
      organisation: string
      'intended-use': number
      'accepts-conditions': boolean
      'display-name': string
    }
  },
) {
  if (!form$?.requestData) {
    return
  }
  const newUser = {
    email: form$.requestData.email,
    password: form$.requestData.password,
    username: form$.requestData['display-name'],
    organisation: form$.requestData.organisation,
    intended_use: form$.requestData['intended-use'],
  } satisfies phoenixBackend.CreateUser

  let resp: Awaited<ReturnType<typeof phoenixBackend.postV2Users>>
  try {
    resp = await phoenixBackend.postV2Users(newUser)
  } catch (e) {
    console.error('Signup rejected by backend. Cause: ', e)
    throw new SolardocUnreachableError('Encountered network error during sign up')
  }

  if (resp.status === 201) {
    console.log('Signup successful')
    currentUserStore.setCurrentUser(resp.data)
    await $router.push('login')
  } else if (resp.status === 400) {
    throw new PhoenixBadRequestError('Server rejected sign up', resp.data as ActualPhxErrorResp)
  } else {
    throw new SolardocUnreachableError('Encountered network error during sign up')
  }
}
</script>

<template>
  <div id="profile-wrapper" class="page-content-wrapper">
    <div id="profile-container" class="page-content-container">
      <div id="already-have-an-account">
        <p>Already have an account?</p>
        <a class="emphasised-link" @click="$router.push('login')">→ Log in</a>
      </div>
      <h1 id="login-signup-title">Sign up</h1>
      <Vueform
        ref="form$"
        :display-errors="false"
        :endpoint="false"
        add-class="solardoc-style-form"
        @submit="(value: any) => interceptErrors(submitForm(value))"
      >
        <TextElement
          :rules="['required', 'email']"
          info="The email that will be used when contacting you regarding info or important matters e.g. resetting your password."
          input-type="email"
          label="Email"
          name="email"
          autocomplete="username"
        />
        <TextElement
          :rules="['required', 'min:6', 'max:20']"
          label="Display Name"
          name="display-name"
        />
        <TextElement
          :rules="[
            'required',
            'min:12',
            'regex:/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!?@#$%^&*_<>~]).{12,}$/',
          ]"
          info="Use at least 12 characters, at least one uppercase and lowercase letter, one number and one special character."
          input-type="password"
          label="Password"
          name="password"
          autocomplete="new-password"
        />
        <TextElement
          info="Potentially allows you to be eligible for organisation-specific benefits."
          label="Organisation"
          name="organisation"
        />
        <SelectElement
          :items="[
            {
              value: 0,
              label: 'Creating presentations',
            },
            {
              value: '1',
              label: 'Education & Teaching',
            },
            {
              value: '2',
              label: 'Collaborating with others',
            },
            {
              value: '3',
              label: 'Other',
            },
          ]"
          :native="false"
          :rules="['required']"
          :search="true"
          autocomplete="off"
          info="What you are planning to use Solardoc for."
          input-type="search"
          label="Intended Use"
          name="intended-use"
        />
        <CheckboxElement
          :rules="['required', 'accepted']"
          field-name="usage conditions"
          name="accepts-conditions"
          size="lg"
          text="You, as the user, acknowledge that Solardoc is still in development and as such can not provide any guarantee for satisfaction or consistent user experience."
        />
        <ButtonElement
          :columns="{
            container: 2,
          }"
          :submits="true"
          button-label="Submit"
          name="submit"
        />
        <ButtonElement
          :columns="{
            container: 3,
          }"
          :resets="true"
          :secondary="true"
          align="center"
          button-label="Reset"
          name="reset"
        />
      </Vueform>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/core/var' as var;
@use '@/assets/page-content' as *;

#profile-wrapper {
  #login-signup-title {
    width: 100%;
  }

  h1 {
    margin-top: 0.7rem;
  }

  #already-have-an-account {
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
