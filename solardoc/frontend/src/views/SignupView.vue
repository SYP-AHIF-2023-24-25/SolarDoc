<script setup lang="ts">
import type { Vueform } from '@vueform/vueform'
import * as phoenixBackend from '@/services/phoenix/api-service'
import { useCurrentUserStore } from '@/stores/current-user'
import { useRouter } from 'vue-router'
import { SolardocUnreachableError } from '@/errors/unreachable-error'
import { type ActualPhxErrorResp, PhoenixBadRequestError } from '@/services/phoenix/errors'
import { interceptErrors } from '@/errors/error-handler'

const $router = useRouter()
const currentUserStore = useCurrentUserStore()

async function submitForm(
  form$: Vueform & {
    requestData: {
      username: string
      email: string
      password: string
      organisation: string
      'intended-use': number
      'accepts-conditions': boolean
    }
  },
) {
  if (!form$?.requestData) {
    return
  }
  const newUser = {
    email: form$.requestData.email,
    password: form$.requestData.password,
    username: form$.requestData.username,
    organisation: form$.requestData.organisation,
    intended_use: form$.requestData['intended-use'],
  } satisfies phoenixBackend.CreateUser

  let resp: Awaited<ReturnType<typeof phoenixBackend.postV1Users>>
  try {
    resp = await phoenixBackend.postV1Users(newUser)
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
        add-class="solardoc-style-form"
        :display-errors="false"
        :endpoint="false"
        @submit="(value: any) => interceptErrors(submitForm(value))"
      >
        <TextElement name="username" label="Username" :rules="['required', 'min:6', 'max:20']" />
        <TextElement
          name="email"
          input-type="email"
          :rules="['required', 'email']"
          label="Email"
          info="The email that will be used when contacting you regarding info or important matters e.g. resetting your password."
        />
        <TextElement
          name="password"
          input-type="password"
          label="Password"
          :rules="[
            'required',
            'min:12',
            'regex:/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!?@#$%^&*_<>~]).{12,}$/',
          ]"
          info="Use at least 12 characters, at least one uppercase and lowercase letter, one number and one special character."
        />
        <TextElement
          name="organisation"
          label="Organisation"
          info="Potentially allows you to be eligible for organisation-specific benefits."
        />
        <SelectElement
          name="intended-use"
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
          :search="true"
          :native="false"
          input-type="search"
          autocomplete="off"
          :rules="['required']"
          label="Intended Use"
          info="What you are planning to use Solardoc for."
        />
        <CheckboxElement
          name="accepts-conditions"
          text="You, as the user, acknowledge that Solardoc is still in development and as such can not provide any guarantee for satisfaction or consistent user experience."
          size="lg"
          :rules="['required', 'accepted']"
          field-name="usage conditions"
        />
        <ButtonElement
          name="submit"
          button-label="Submit"
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
            container: 3,
          }"
          align="center"
        />
      </Vueform>
    </div>
  </div>
</template>

<style scoped lang="scss">
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
