<script setup>
import { computed, onMounted } from 'vue'
import { useUserStore } from '@/lib/userStore'

import TitleMain from '@/components/title/TitleMain.vue'
import TitleSection from '@/components/title/TitleSection.vue'
import ListTask from '@/components/list/ListTask.vue'
import SectionNav from '@/components/nav/SectionNav.vue'

const userStore = useUserStore()
const tasks = computed(() => userStore.tasks)

</script>


<template>
  <main>

    <TitleMain title="Tasks" />

    <SectionNav 
      :button="{ text: 'Filters', type: 'filters', action: () => showListFilters = true }" 
    />

    <ul class="list">
      <TitleSection
        title="Recent activity"
        :button="{
          text: 'See all',
          type: 'add',
          action: () => console.log('See all activity clicked')
        }"
      />
      <ListTask :tasks="tasks" />
    </ul>
  </main>
</template>
