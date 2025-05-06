<script setup>
import { ref } from 'vue'
import { defineEmits } from 'vue'
import InputNormal from '@/components/input/InputNormal.vue'

const firstName = ref('')
const lastName = ref('')
const emailUser = ref('')
const selectedProjects = ref([])
const inviteSent = ref(false)

const emit = defineEmits(['close', 'invite'])

function handleSubmit(event) {
  event.preventDefault()

  const form = event.target
  if (!form.checkValidity()) {
    form.reportValidity()
    return
  }

  const name = (firstName.value + ' ' + lastName.value).trim()
  const email = emailUser.value.trim()

  const user = {
    name,
    email,
    projects: selectedProjects.value,
    joined: new Date().toLocaleDateString(),
    lastActivity: new Date().toLocaleDateString()
  }

  emit('invite', user)
  inviteSent.value = true
}

function handleClose() {
  emit('close')
}
</script>

<template>
  <div class="modal">
    <form class="add" @submit="handleSubmit">
      <h1>Invite Collaborator</h1>

      <ul class="form" v-if="!inviteSent">
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
          v-model="emailUser"
          :required="true"
        />
      </ul>

      <ul class="confirm" v-else>
        <li>Yeah!</li>
        <li><h2>Invite sent</h2></li>
        <li><p>User will receive an email to confirm their account creation</p></li>
      </ul>

      <button
        :type="inviteSent ? 'close' : 'submit'"
        @click="inviteSent ? handleClose() : null"
      >
        {{ inviteSent ? 'Close' : 'Send invite' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.error {
  color: var(--is-red);
  margin-top: 0.5rem;
}
</style>
