<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/lib/userStore'

import InputNormal from '@/components/input/InputNormal.vue'
import InputTextarea from '@/components/input/InputTextarea.vue'
import ListUser from '@/components/list/ListUser.vue'
import TitleMain from '@/components/title/TitleMain.vue'
import TitleSection from '@/components/title/TitleSection.vue'
import AddCollaborator from '@/components/modal/AddCollaborator.vue'

const router = useRouter()
const userStore = useUserStore()

const showAddCollaborator = ref(false)
const collaborators = ref([])

const projectTitle = ref('')
const projectUrl = ref('')
const projectDetails = ref('')
const saving = ref(false)
const error = ref('')

async function saveProject() {
  if (!projectTitle.value || !projectUrl.value) {
    error.value = 'Title and URL are required.'
    return
  }

  saving.value = true
  error.value = ''

  const { data, error: createError } = await userStore.createProject({
    title: projectTitle.value,
    url: projectUrl.value,
    details: projectDetails.value,
    collaborators: collaborators.value
  })

  saving.value = false

  if (createError) {
    console.error('❌ Project insert failed:', createError)
    error.value = createError.message
    return
  }

  router.push(`/projects/${data.id}`)
}
</script>

<template>
  <main>

    <TitleMain
        title="New project"
        :button="{
          text: saving ? 'Saving...' : 'Create',
          type: 'create',
          action: saveProject
        }"
      />

    <ul class="list">

      <TitleSection
        title="Project settings"
        toggle="Users will be requested to provide their email address to receive the content of the post by email."
      />

      <InputNormal
        label="Project title"
        placeholder="Input placeholder"
        v-model="projectTitle"
      />
      <InputNormal
        label="Site URL"
        placeholder="Input placeholder"
        v-model="projectUrl"
      />
      <InputTextarea
        label="Project details"
        placeholder="Input placeholder"
        v-model="projectDetails"
      />

      <p v-if="error" class="error">{{ error }}</p>
    </ul>

    <ul class="list">
      <TitleSection
        title="Collaborators"
        :button="{
          text: 'Add user',
          type: 'add',
          action: () => showAddCollaborator = true
        }"
      />

      <li v-if="collaborators.length === 0" class="empty">
        <p>No user</p>
      </li>

      <ListUser
        v-for="(user, index) in collaborators"
        :key="index"
        :user="user"
        @remove="collaborators.splice(index, 1)"
      />
    </ul>

    <AddCollaborator
      v-if="showAddCollaborator"
      @close="showAddCollaborator = false"
      @invite="(user) => collaborators.push(user)"
    />
  </main>
</template>

<style scoped>
.error {
  color: var(--is-red);
  margin-top: 1rem;
}
</style>
