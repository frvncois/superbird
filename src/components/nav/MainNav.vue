<template>
  <header>
    <div>
      <img src="@/assets/logo.svg" />
      <h1>Lands</h1>
    </div>
    <nav>
      <ul>
        <RouterLink to="/" custom v-slot="{ href, navigate, isActive }">
          <li>
            <a :href="href" @click="navigate" :class="{ active: isActive }">
              <DashboardIcon />
              <span>Dashboard</span>
            </a>
          </li>
        </RouterLink>
        <RouterLink to="/projects" custom v-slot="{ href, navigate, isActive }">
          <li>
            <a :href="href" @click="navigate" :class="{ active: isActive }">
              <ProjectsIcon />
              <span>Projects</span>
            </a>
          </li>
        </RouterLink>
        <RouterLink to="/tasks" custom v-slot="{ href, navigate, isActive }">
          <li>
            <a :href="href" @click="navigate" :class="{ active: isActive }">
              <TasksIcon />
              <span>Tasks</span>
            </a>
          </li>
        </RouterLink>
        <RouterLink to="/collaborators" custom v-slot="{ href, navigate, isActive }">
          <li>
            <a :href="href" @click="navigate" :class="{ active: isActive }">
              <CollaboratorsIcon />
              <span>Collaborators</span>
            </a>
          </li>
        </RouterLink>
        <RouterLink to="/integrations" custom v-slot="{ href, navigate, isActive }">
          <li>
            <a :href="href" @click="navigate" :class="{ active: isActive }">
              <IntegrationsIcon />
              <span>Integrations</span>
            </a>
          </li>
        </RouterLink>
        <RouterLink to="/settings" custom v-slot="{ href, navigate, isActive }">
          <li>
            <a :href="href" @click="navigate" :class="{ active: isActive }">
              <SettingsIcon />
              <span>Setting</span>
            </a>
          </li>
        </RouterLink>
      </ul>

      <ul>
        <li>
          <span>{{ initials }}</span>
          <p>{{ fullName }}</p>
        </li>
        <button class="logout" @click="handleLogout">
          <LogoutIcon />Logout
        </button>
      </ul>
    </nav>
  </header>
</template>



<script setup>
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useUserStore } from '@/lib/userStore'
import { supabase } from '@/lib/supabase'

import DashboardIcon from '@/assets/DashboardIcon.vue'
import ProjectsIcon from '@/assets/ProjectsIcon.vue'
import IntegrationsIcon from '@/assets/IntegrationsIcon.vue'
import CollaboratorsIcon from '@/assets/CollaboratorsIcon.vue'
import SettingsIcon from '@/assets/SettingsIcon.vue'
import TasksIcon from '@/assets/TasksIcon.vue'
import LogoutIcon from '@/assets/LogoutIcon.vue'

const router = useRouter()
const userStore = useUserStore()

const fullName = computed(() => userStore.profile?.full_name || 'User')
const initials = computed(() => {
  if (!userStore.profile?.full_name) return '??'
  const names = userStore.profile.full_name.trim().split(' ')
  return names.map(n => n[0].toUpperCase()).join('').slice(0, 2)
})

async function handleLogout() {
  await supabase.auth.signOut()
  router.go(0)
}
</script>
  