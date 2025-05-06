<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/lib/userStore'

import TitleMain from '@/components/title/TitleMain.vue'
import TitleSection from '@/components/title/TitleSection.vue'
import ListTask from '@/components/list/ListTask.vue'
import ListParent from '@/components/list/ListParent.vue'

const userStore = useUserStore()
const tasks = computed(() => userStore.tasks)
const projects = computed(() => userStore.projects)
</script>

<template>
  <main>
    <TitleMain title="Welcome back" />

    <ul class="list">
      <TitleSection
      title="Recent projects"
      :button="{
        text: 'See all',
        type: 'add',
        action: () => console.log('See all tasks clicked')
      }"
    />

    <ListParent
        v-for="project in projects"
        :key="project.id"
        :project="project"
        :taskCount="userStore.tasks.filter(t => t.project_id === project.id).length"
      />


    </ul>

    <ul class="list">
      <TitleSection
      title="Recent tasks"
      :button="{
        text: 'See all',
        type: 'add',
        action: () => console.log('See all tasks clicked')
      }"
    />

      <ListTask :tasks="tasks" />


    </ul>
    
  </main>
</template>
