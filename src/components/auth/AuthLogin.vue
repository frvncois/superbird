<script setup>
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { defineEmits } from 'vue'

import AppButton from '@/components/button/AppButton.vue'
import InputNormal from '@/components/input/InputNormal.vue'
import InputToggle from '@/components/input/InputToggle.vue'
import UserIcon from '@/assets/UserIcon.vue'

const emit = defineEmits(['login'])

const showSignUp = ref(false)
const acceptedCommunications = ref(true)
const acceptedTerms = ref(false)

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const loginEmail = ref('')
const loginPassword = ref('')
const errorMessage = ref('')

function toggleAuthMode() {
  showSignUp.value = !showSignUp.value
  errorMessage.value = ''
}

async function handleLogin(event) {
  event.preventDefault()
  errorMessage.value = ''

  if (showSignUp.value) {
    if (!acceptedTerms.value) {
      errorMessage.value = 'You must accept the terms to continue.'
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          first_name: firstName.value,
          last_name: lastName.value,
          accepted_communications: acceptedCommunications.value
        }
      }
    })

    if (error) return (errorMessage.value = error.message)
    if (!data.user) return (errorMessage.value = 'Signup failed.')

    emit('login')
  } else {
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.value,
      password: loginPassword.value
    })

    if (error) return (errorMessage.value = error.message)

    emit('login')
  }
}
</script>

<template>
  <ul class="auth">
    <li>
      <h1>Lands</h1>
      <AppButton
        :text="showSignUp ? 'Already have an account?' : 'No account?'"
        type="auth"
        :action="toggleAuthMode"
        :icon="UserIcon"
      />
    </li>

    <!-- Sign In -->
    <li v-show="!showSignUp">
      <div>
        <h2>Sign in</h2>
        <h1>Welcome back</h1>
      </div>
      <form class="auth" @submit="handleLogin">
        <input type="email" name="login_email" placeholder="Your email" v-model="loginEmail" required />
        <input type="password" name="login_password" placeholder="Password" v-model="loginPassword" required />
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        <button type="submit">Continue</button>
      </form>
    </li>

    <!-- Sign Up -->
    <li v-show="showSignUp">
      <div>
        <h2>Sign up</h2>
        <h1>Join Lands for free</h1>
      </div>
      <form class="auth" @submit="handleLogin">
        <ul class="list">
          <InputNormal
            label="First name"
            name="first_name"
            placeholder="Jane"
            v-model="firstName"
            :required="true"
          />
          <InputNormal
            label="Last name"
            name="last_name"
            placeholder="Doe"
            v-model="lastName"
            :required="true"
          />
          <InputNormal
            label="Email"
            name="email"
            placeholder="your@email.com"
            v-model="email"
            :required="true"
          />
          <InputNormal
            label="Password"
            name="password"
            type="password"
            placeholder="Password"
            v-model="password"
            :required="true"
          />
          <InputToggle
            label="Communications"
            note="Users will be requested to provide their email address to receive the content of the post by email."
            v-model="acceptedCommunications"
          />
          <InputToggle
            label="Terms and conditions"
            note="Users must accept before continuing."
            v-model="acceptedTerms"
          />
        </ul>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        <button type="submit">Continue</button>
      </form>
    </li>

    <li>
      <span>
        By using Lands, you agree to the Terms of Service and Privacy Policy, including Cookie Use.<br>
        Made with ❤ by Lands
      </span>
    </li>
  </ul>
</template>

<style scoped>
input::placeholder {
  color: var(--is-gray);
}
.error {
  color: var(--is-red);
  margin-top: 0.5rem;
}
</style>
