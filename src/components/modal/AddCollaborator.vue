<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/lib/userStore'
import ListCollaborator from '@/components/list/ListCollaborator.vue'

const emit = defineEmits(['close'])
const collaborators = ref([])
const addedIds = ref(new Set())
const projectId = useRoute().params.id
const userStore = useUserStore()

onMounted(async () => {
  if (!userStore.user) await userStore.loadUser()
  const userId = userStore.user.id

  const { data: youInvited } = await supabase
    .from('collaborators')
    .select('collaborator_id, profiles:collaborator_id (id, full_name, email)')
    .eq('user_id', userId)
    .eq('invite_status', 'accepted')

  const { data: theyInvitedYou } = await supabase
    .from('collaborators')
    .select('user_id, profiles:user_id (id, full_name, email)')
    .eq('collaborator_id', userId)
    .eq('invite_status', 'accepted')

  const seen = new Set()

  for (const item of youInvited || []) {
    const profile = item.profiles
    if (profile && !seen.has(profile.id)) {
      seen.add(profile.id)
      collaborators.value.push({ id: profile.id, name: profile.full_name, email: profile.email })
    }
  }

  for (const item of theyInvitedYou || []) {
    const profile = item.profiles
    if (profile && !seen.has(profile.id)) {
      seen.add(profile.id)
      collaborators.value.push({ id: profile.id, name: profile.full_name, email: profile.email })
    }
  }
})

async function addCollaborator(userId) {
  if (addedIds.value.has(userId)) return

  const { data: project, error } = await supabase
    .from('projects')
    .select('collaborator_ids')
    .eq('id', projectId)
    .maybeSingle()

  if (error || !project) {
    console.error('❌ Failed to load project:', error)
    return
  }

  const updatedIds = [...new Set([...(project.collaborator_ids || []), userId])]

  const { error: updateError } = await supabase
    .from('projects')
    .update({ collaborator_ids: updatedIds })
    .eq('id', projectId)

  if (updateError) {
    console.error('❌ Failed to update project collaborators:', updateError)
    return
  }

  console.log(`✅ Added user ${userId} to project ${projectId}`)
  addedIds.value.add(userId)

  const addedUser = collaborators.value.find(user => user.id === userId)
  if (addedUser) {
    addedUser.added = true
  }
}
</script>

<template>
  <div class="modal">
    <div class="wrap">
      <h1>Add Collaborators</h1>

      <ul class="list">
        <ListCollaborator
          v-for="user in collaborators"
          :key="user.id"
          :user="user"
          :add-collaborator="() => addCollaborator(user.id)"
        />
        <button type="close" @click="emit('close')">Close</button>
      </ul>

    </div>
  </div>
</template>