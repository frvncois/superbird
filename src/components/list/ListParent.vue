<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  project: Object,
  taskCount: {
    type: Number,
    default: 0
  }
})

const router = useRouter()
const goToTask = () => router.push(`/projects/${props.project.id}`)
</script>

<template>
  <li class="card">
    <img alt="icon" />
    <div class="header">
      <ul>
        <li><h3>{{ project.title }}</h3></li>
        <p>{{ project.url }}</p>
      </ul>
      <ul>
        <li><span class="tag active">{{ taskCount }} Active tasks</span></li>
      </ul>
    </div>
    <div class="actions">
      <button class="green" @click="goToTask">Open</button>
    </div>
  </li>
</template>
