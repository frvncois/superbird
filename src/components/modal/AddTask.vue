<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/lib/userStore'

import InputNormal from '@/components/input/InputNormal.vue'
import InputDropdown from '@/components/input/InputDropdown.vue'
import InputTextarea from '@/components/input/InputTextarea.vue'

const emit = defineEmits(['close'])
const props = defineProps({
  pinRect: Object,        // receives pin position
  pageUrl: String         // receives page URL from iframe
})

const userStore = useUserStore()
const route = useRoute()
const projectId = route.params.id
const selectedPageUrl = ref('')


const title = ref('')
const details = ref('')
const assignedTo = ref([])
const options = ref([])
const error = ref('')

onMounted(async () => {
  if (!userStore.user) await userStore.loadUser()

  const { data: project, error: fetchError } = await supabase
    .from('projects')
    .select('collaborator_ids')
    .eq('id', projectId)
    .single()

  if (fetchError) {
    console.error('❌ Failed to load collaborators:', fetchError)
    return
  }

  const ids = project.collaborator_ids || []
  ids.push(userStore.user.id)

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', ids)

  if (profilesError) {
    console.error('❌ Failed to load profiles:', profilesError)
    return
  }

  options.value = profiles.map(p => ({ value: p.id, label: p.full_name }))
})

async function addTask() {
  if (!title.value) {
    error.value = 'Task title is required.'
    return
  }

  const selector = JSON.stringify({
    ...props.pinRect,
    scrollX: window.scrollX,
    scrollY: window.scrollY
  })

  const { data, error: insertError } = await supabase
    .from('tasks')
    .insert({
      project_id: projectId,
      added_by: userStore.user.id,
      title: title.value,
      details: details.value,
      assigned_to: assignedTo.value.length ? assignedTo.value : null,
      selector,
      page_url: props.pageUrl || null
    })
    .select()
    .single() 

  if (insertError) {
    console.error('❌ Failed to add task:', insertError)
    error.value = insertError.message
  } else {
    console.log('✅ Task added:', data)
    emit('close')
    emit('task-added', data) 
  }
}

</script>

<template>
  <div class="modal">
    <div class="wrap">
      <h1>Add task</h1>
      <ul class="form">
        <InputNormal label="Title" placeholder="Input placeholder" v-model="title" />
        <InputTextarea label="Details" placeholder="Input placeholder" v-model="details" />
        <InputDropdown
          label="Assign to"
          placeholder="Select multiple options"
          :options="options"
          :multiple="true"
          v-model="assignedTo"
        />
      </ul>
      <button @click="addTask">Add task</button>
      <p class="error" v-if="error">{{ error }}</p>
    </div>
  </div>
</template>
