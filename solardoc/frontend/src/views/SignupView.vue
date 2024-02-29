<script setup lang="ts">
import {useDarkModeStore} from "@/stores/dark-mode";

const darkModeStore = useDarkModeStore()
</script>

<template>
  <div id="wrapper" class="login-signup-wrapper">
    <div id="container" class="login-signup-container">
      <Vueform add-class="solardoc-style-form" :display-errors="false">
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
              'min:8',
              'regex:/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/',
            ]"
            info="Use at least 8 characters, at least one letter, one number and one special character."
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
      </Vueform>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/core/var' as var;
@use '@/assets/login-signup' as *;
</style>
