<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/lib/userStore'

import TitleMain from '@/components/title/TitleMain.vue'
import TitleSection from '@/components/title/TitleSection.vue'
import ListUser from '@/components/list/ListUser.vue'
import SectionNav from '@/components/nav/SectionNav.vue'
import InviteCollaborator from '@/components/modal/InviteCollaborator.vue'

const showInviteCollaborator = ref(false)
const incomingInvites = ref([])

const userStore = useUserStore()
const collaborators = computed(() => userStore.collaborators)

onMounted(async () => {
  if (!userStore.loaded) await userStore.loadUser()
  if (userStore.user?.email) await loadIncomingInvites()
})


async function loadIncomingInvites() {
  const { data, error } = await supabase
    .from('pending_users')
    .select('id, first_name, last_name, invited_by')
    .eq('email', userStore.user.email)

  if (error) console.error('❌ incomingInvites error:', error)
  incomingInvites.value = data || []
  console.log('📬 incomingInvites.value:', incomingInvites.value)
}

async function acceptInvite(invite) {
  const { error: collabError } = await supabase
    .from('collaborators')
    .upsert({
      user_id: invite.invited_by,
      collaborator_id: userStore.user.id,
      invite_status: 'accepted'
    })

  if (collabError) {
    console.error('❌ Accept failed:', collabError)
    return
  }

  await supabase.from('pending_users').delete().eq('id', invite.id)
  incomingInvites.value = incomingInvites.value.filter(i => i.id !== invite.id)
  await userStore.loadUser()
}

async function declineInvite(invite) {
  await supabase.from('pending_users').delete().eq('id', invite.id)
  incomingInvites.value = incomingInvites.value.filter(i => i.id !== invite.id)
}

async function handleInvite(userData) {
  const email = userData.email.trim().toLowerCase()
  const fullName = userData.name.trim()
  const [firstName, ...rest] = fullName.split(' ')
  const lastName = rest.join(' ') || ''

  const { data: existingUser, error } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('email', email)
    .maybeSingle()

  if (error) console.error('❌ handleInvite profile error:', error)

  if (existingUser?.id) {
    await supabase.from('collaborators').upsert({
      user_id: userStore.user.id,
      collaborator_id: existingUser.id,
      invite_status: 'accepted'
    })
    await userStore.loadUser()
    return
  }

  const { data: insertedUser, error: pendingError } = await supabase
    .from('pending_users')
    .insert({
      first_name: firstName,
      last_name: lastName,
      email,
      invited_by: userStore.user.id
    })
    .select()
    .single()

  if (pendingError) console.error('❌ handleInvite pending error:', pendingError)
}
</script>

<template>
  <main>
    <TitleMain title="Collaborators" />

    <SectionNav 
      :button="{ text: 'Filters', type: 'filters', action: () => showListFilters = true }" 
    />

    <ul v-if="incomingInvites.length" class="alert">
      <li v-for="invite in incomingInvites" :key="invite.id">
        <strong>{{ invite.first_name }} {{ invite.last_name }}</strong> invited you to collaborate.
        <button @click="acceptInvite(invite)">Accept</button>
        <button @click="declineInvite(invite)">Decline</button>
      </li>
    </ul>

    <ul class="list">
      <TitleSection
        title="Collaborators"
        :button="{
          text: 'Send invite',
          type: 'add',
          action: () => showInviteCollaborator = true
        }"
      />

      <li v-if="collaborators.length === 0" class="empty">
        <p>No collaborators</p>
      </li>

      <ListUser
        v-for="(user, index) in collaborators"
        :key="index"
        :user="user"
        @remove="() => userStore.loadUser()"
      />
    </ul>

    <InviteCollaborator
      v-if="showInviteCollaborator"
      @close="showInviteCollaborator = false"
      @invite="handleInvite"
    />
  </main>
</template>