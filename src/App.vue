<script setup>
import { ref, onMounted, computed } from 'vue'
import { RouterView } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/lib/userStore'
import { useRoute } from 'vue-router'
import PreviewApp from '@/components/preview/PreviewApp.vue'

import MainNav from './components/nav/MainNav.vue'
import AuthLogin from './components/auth/AuthLogin.vue'

const route = useRoute()
const previewRef = ref(null)


// Show preview for both project view and content view
const showPreview = computed(() => {
  const isProjectRoute = route.path.startsWith('/projects/') && !!currentProject.value
  const isContentRoute = route.name === 'ContentView' && !!currentProject.value
  return isProjectRoute || isContentRoute
})

// Get current project from either route param id or projectId
const currentProject = computed(() => {
  const projectId = route.params.id || route.params.projectId
  return userStore.projects.find(p => p.id === projectId) || null
})

const projectTasks = computed(() => {
  const projectId = route.params.id || route.params.projectId
  return userStore.tasks.filter(t => t.project_id === projectId)
})

const isLoggedIn = ref(false)
const userStore = useUserStore()

let booted = false

async function initUser(session) {
  isLoggedIn.value = !!session
  if (!booted && session) {
    booted = true
    await userStore.loadUser()
  }
}

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  initUser(session)
})

supabase.auth.onAuthStateChange((_event, session) => {
  initUser(session)
  if (!session) userStore.$reset()
})
</script>

<template>
  <template v-if="isLoggedIn">
    <MainNav />
    <RouterView />
    <aside v-if="showPreview">
      <PreviewApp ref="previewRef" :project="currentProject" :tasks="projectTasks" />

    </aside>
  </template>

  <template v-else>
    <AuthLogin @login="isLoggedIn = true" />
    <img class="splash" src="@/assets/demo.png" />
  </template>
</template>