<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/lib/userStore'

import TitleMain from '@/components/title/TitleMain.vue'
import SectionNav from '@/components/nav/SectionNav.vue'
import TitleSection from '@/components/title/TitleSection.vue'
import ListFilters from '@/components/modal/ListFilters.vue'
import ListParent from '@/components/list/ListParent.vue'

const router = useRouter()
const showListFilters = ref(false)
const userStore = useUserStore()

const projects = computed(() => userStore.projects)
</script>

 
<template>
  <main>
    <TitleMain 
      title="Projects" 
      :button="{
        text: 'Create Project',
        type: 'create',
        action: () => router.push('/create')
      }"
    />
    
    <SectionNav 
      :button="{ text: 'Filters', type: 'filters', action: () => showListFilters = true }" 
    />
    
    <ListFilters 
      v-if="showListFilters" 
      @close="showListFilters = false" 
    />

    <ul class="list">
      <li v-if="projects.length === 0" class="empty">
        <p>You don’t have any project yet.</p>
      </li>
      <ListParent
        v-for="project in projects"
        :key="project.id"
        :project="project"
        :taskCount="userStore.tasks.filter(t => t.project_id === project.id).length"
      />

    </ul>
  </main>
</template>
