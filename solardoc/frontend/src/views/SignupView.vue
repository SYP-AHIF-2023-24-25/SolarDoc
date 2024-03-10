<script setup lang="ts">
import {ref} from "vue"
import * as phoenixBackend from "@/services/phoenix/api-service"
import {useCurrentUserStore} from "@/stores/current-user"
import {useRouter} from "vue-router"

const $router = useRouter()
const currentUserStore = useCurrentUserStore()

const form$ = ref<{
  data: {
    username: string,
    email: string,
    password: string,
    organisation: string,
    intendedUse: string,
    acceptsConditions: boolean,
  }
} | null>(null)

function submitForm() {
  if (!form$.value) {
    throw new Error("Form data is null")
  }

  const newUser = {
    email: form$.value.data.email,
    password: form$.value.data.password,
  } satisfies phoenixBackend.CreateUser
  phoenixBackend
    .postV1Users(newUser)
    .then((resp) => {
      if (resp.status === 201) {
        console.log("Signup successful")
        currentUserStore.setCurrentUser(resp.data)
      } else if (resp.status === 400) {
        throw new Error("Server rejected sign up. Cause: Bad request")
      } else {
        throw new Error("Server rejected sign up. Cause: Unknown error (status: " + (resp as {status: never}).status + ")")
      }

      $router.push("login")
    })
    .catch((error) => {
      throw new Error("Signup rejected by backend. Cause: " + error)
    });
}
</script>

<template>
  <div id="profile-wrapper" class="page-form-wrapper">
    <div id="profile-container" class="page-form-container">
      <div id="already-have-an-account">
        <p>Already have an account?</p>
        <a class="emphasised-link" @click="$router.push('login')">→ Log in</a>
      </div>
      <h1 id="login-signup-title">Sign up</h1>
      <Vueform ref="form$" add-class="solardoc-style-form" :display-errors="false">
        <TextElement
            name="username"
            label="Username"
            :rules="[
              'required',
              'min:6',
            ]"
        />
        <TextElement
            name="email"
            input-type="email"
            :rules="[
              'required',
              'email',
            ]"
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
              'regex:/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{12,}$/',
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
            label="Intended Use"
            info="What you are planning to use Solardoc for."
        />
        <CheckboxElement
            name="accepts-conditions"
            text="You, as the user, acknowledge that Solardoc is still in development and as such can not provide any guarantee for satisfaction or consistent user experience."
            size="lg"
            :rules="[
              'accepted',
            ]"
            field-name="usage conditions"
        />
        <ButtonElement
            name="submit"
            button-label="Submit"
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
      </Vueform>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/var' as var;
@use '@/assets/page-form' as *;

#profile-wrapper {
  #login-signup-title {
    width: 100%
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
