<script setup>
import { ref, computed, watchEffect, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/lib/userStore'

// Input components
import InputNormal from '@/components/input/InputNormal.vue'
import InputTextarea from '@/components/input/InputTextarea.vue'
import InputButton from '@/components/input/InputButton.vue'

// Title components
import TitleMain from '@/components/title/TitleMain.vue'
import TitleSection from '@/components/title/TitleSection.vue'

// Navigation components
import TabNav from '@/components/nav/TabNav.vue'
import SectionNav from '@/components/nav/SectionNav.vue'

// List components
import ListTask from '@/components/list/ListTask.vue'
import ListFile from '@/components/list/ListFile.vue'
import ListUser from '@/components/list/ListUser.vue'
import ListFilters from '@/components/modal/ListFilters.vue'
import ListContent from '@/components/list/ListContent.vue'

// Modal components
import AddTask from '@/components/modal/AddTask.vue'
import AddCollaborator from '@/components/modal/AddCollaborator.vue'
import AddFile from '@/components/modal/AddFile.vue'
import DeleteProject from '@/components/modal/DeleteProject.vue'

// Setup route and router
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const projectId = route.params.id

// Modal visibility states
const showListFilters = ref(false)
const showAddTask = ref(false)
const showAddFile = ref(false)
const showAddCollaborator = ref(false)
const showDeleteProject = ref(false)

// Filter states
const filters = ref({
  active: true,
  resolved: true,
  assignedToMe: true,
  assignedToOthers: true,
  sort: 'Newest'
})

const taskToggles = ['active', 'resolved', 'assignedToMe', 'assignedToOthers']

// Project data
const project = computed(() => {
  return userStore.projects.find(p => p.id === projectId) || null
})

const projectTasks = computed(() =>
  userStore.tasks.filter(task => task.project_id === projectId)
)

const collaborators = computed(() =>
  userStore.collaborators.filter(c => project.value?.collaborator_ids?.includes(c.id))
)

// Project form fields
const projectTitle = ref('')
const projectUrl = ref('')
const projectDetails = ref('')

// Content list data
const contentList = computed(() => userStore.content?.[projectId] || [])

// Watch for project data changes
watchEffect(() => {
  if (!project.value) return

  projectTitle.value = project.value.title || 'Untitled Project'
  projectUrl.value = project.value.url || ''
  projectDetails.value = project.value.details || ''
})

// Project update function
async function updateProject() {
  const { error } = await userStore.updateProject(projectId, {
    title: projectTitle.value,
    url: projectUrl.value,
    details: projectDetails.value
  })
  
  if (error) console.error('❌ Update failed:', error)
}

// Collaborator management
async function removeCollaborator(userId) {
  await userStore.removeCollaboratorFromProject(projectId, userId)
}

// Project deletion
async function deleteCurrentProject() {
  try {
    await userStore.deleteProject(projectId)
    router.push('/projects')
  } catch (error) {
    console.error('Error deleting project:', error)
    alert('Failed to delete project: ' + error.message)
  }
}

// Content navigation - redirects to ContentView
function navigateToContentView(content = null) {
  router.push({
    name: 'ContentView',
    params: { 
      projectId: projectId,
      contentId: content?.id || undefined
    }
  })
}

// Load user data if not already loaded
onMounted(async () => {
  if (!userStore.loaded) {
    await userStore.loadUser()
  }
})
</script>

<template>
  <main v-if="userStore.loaded">
    <TitleMain :title="projectTitle" />

    <TabNav :tabs="['Tasks', 'Files', 'Content', 'Team', 'Settings']">
      
      <template #tasks>
        <SectionNav
          :button="{ text: 'Filters', type: 'filters', action: () => showListFilters = !showListFilters }" />
        <ul class="list">
          <TitleSection 
            title="Active task"
            :button="{ text: 'Add task', type: 'add', action: () => showAddTask = true }" />

          <ListFilters
            v-if="showListFilters"
            :filters="filters"
            :toggles="taskToggles"
            @close="showListFilters = false"
          />

          <ListTask
            :project-id="projectId"
            :tasks="projectTasks"
            :filters="filters"
          />
        </ul>
      </template>

      <template #files>
        <SectionNav
          :button="{ text: 'Filters', type: 'filters', action: () => showListFilters = !showListFilters }" />
        <ul class="list">
          <TitleSection 
            title="Project files"
            :button="{ text: 'Upload file', type: 'add', action: () => showAddFile = true }" />

          <ListFilters
            v-if="showListFilters"
            :filters="filters"
            @close="showListFilters = false"
          />

          <ListFile :items="userStore.getFiles(projectId)" />
        </ul>
      </template>

      <template #content>
        <SectionNav
          :button="{ text: 'Filters', type: 'filters', action: () => showListFilters = !showListFilters }" />
        <ul class="list">
          <TitleSection
            title="Project content"
            :button="{ text: 'Create file', type: 'add', action: () => navigateToContentView() }"
          />

          <ListFilters 
            v-if="showListFilters" 
            :filters="filters"
            @close="showListFilters = false" 
          />

          <ListContent :items="contentList" @open="navigateToContentView" />
        </ul>
      </template>

      <template #team>
        <ul class="list">
          <TitleSection 
            title="Collaborators"
            :button="{ text: 'Add member', type: 'add', action: () => showAddCollaborator = true }" />

          <li v-if="collaborators.length === 0" class="empty">
            <p>No collaborators yet.</p>
          </li>

          <ListUser
            v-for="user in collaborators"
            :key="user.id"
            :user="user"
            @remove="removeCollaborator(user.id)"
          />
        </ul>
      </template>

      <template #settings>
        <ul class="list">
          <TitleSection 
            title="Project Settings"
            :button="{ text: 'Save', type: 'save', action: updateProject }" />
          <InputNormal label="Project title" placeholder="Enter title" v-model="projectTitle" />
          <InputNormal label="Project URL" placeholder="Enter URL" v-model="projectUrl" />
          <InputTextarea label="Details" placeholder="Describe your project" v-model="projectDetails" />
        </ul>
        <ul class="list">
          <TitleSection title="Backup" />
          <InputButton
            label="Tasks"
            :button="{ text: 'Download', type: 'download', action: () => {} }"
            note="Download a CSV format of your tasks"
          />
          <InputButton
            label="Files"
            :button="{ text: 'Download', type: 'download', action: () => {} }"
            note="Download a ZIP format of your tasks"
          />
          <InputButton
            label="Content"
            :button="{ text: 'Download', type: 'download', action: () => {} }"
            note="Download a DOC format of your content"
          />
        </ul>
        <ul class="list">
          <TitleSection title="Danger zone" />
          <InputButton
            label="Delete project"
            :button="{ text: 'Delete', type: 'delete', action: () => showDeleteProject = true }"
          />
        </ul>
      </template>
    </TabNav>

    <!-- Modals -->
    <AddTask
      v-if="showAddTask"
      @close="showAddTask = false"
      @task-added="task => userStore.tasks.push(task)"
    />

    <AddCollaborator 
      v-if="showAddCollaborator" 
      @close="showAddCollaborator = false" 
    />
   
    <AddFile
      v-if="showAddFile"
      @close="showAddFile = false"
      @file-added="file => {
        if (!userStore.files[projectId]) userStore.files[projectId] = []
        userStore.files[projectId].push(file)
      }"
    />

    <DeleteProject
      v-if="showDeleteProject && project"
      :project="project"
      @close="showDeleteProject = false"
      @confirm="deleteCurrentProject"
    />
  </main>
  <p v-else class="loading">Loading project...</p>
</template>