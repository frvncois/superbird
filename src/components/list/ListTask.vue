<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/lib/userStore'

import AppButton from '@/components/button/AppButton.vue'


const props = defineProps({
  projectId: String,
  tasks: {
    type: Array,
    default: () => []
  },
  filters: {
    type: Object,
    default: () => ({
      active: true,
      resolved: true,
      assignedToMe: true,
      assignedToOthers: true,
      sort: 'Newest'
    })
  }
})


const userStore = useUserStore()
const projectId = useRoute().params.id

const tasks = ref([])
const taskRefs = ref({})
const openRefs = ref({})

function setTaskRef(id, el) {
  if (el) taskRefs.value[id] = el
}

function toggle(taskId) {
  const el = taskRefs.value[taskId]
  if (!el) return

  const isOpen = openRefs.value[taskId] ?? false

  if (isOpen) {
    const h = el.scrollHeight
    el.style.height = h + 'px'
    requestAnimationFrame(() => {
      el.style.transition = 'height 300ms ease'
      el.style.height = '0px'
    })
    el.addEventListener('transitionend', function handler() {
      el.style.transition = ''
      el.removeEventListener('transitionend', handler)
    })
  } else {
    el.style.height = 'auto'
    const h = el.scrollHeight
    el.style.height = '0px'
    requestAnimationFrame(() => {
      el.style.transition = 'height 300ms ease'
      el.style.height = h + 'px'
    })
    el.addEventListener('transitionend', function handler() {
      el.style.transition = ''
      el.style.height = 'auto'
      el.removeEventListener('transitionend', handler)
    })
  }

  openRefs.value[taskId] = !isOpen
}

async function toggleStatus(taskId) {
  const task = tasks.value.find(t => t.id === taskId)
  if (!task) return

  const newStatus = !task.active

  const { error } = await supabase
    .from('tasks')
    .update({ active: newStatus })
    .eq('id', taskId)

  if (error) {
    console.error('❌ Failed to update task status:', error)
    return
  }

  task.active = newStatus // Update locally
}

const filteredTasks = computed(() => {
  return tasks.value
    .filter(task => {
      const isActiveMatch =
        (props.filters.active && task.active === true) ||
        (props.filters.resolved && task.active === false)

      const isMine = task.assigned_to?.includes(userStore.user.id)
      const isAssignmentMatch =
        (props.filters.assignedToMe && isMine) ||
        (props.filters.assignedToOthers && !isMine)

      return isActiveMatch && isAssignmentMatch
    })
    .sort((a, b) => {
      const dateA = new Date(a.updated_at)
      const dateB = new Date(b.updated_at)
      return props.filters.sort === 'Newest'
        ? dateB - dateA
        : dateA - dateB
    })
})

onMounted(async () => {
  if (props.tasks !== null) {
    tasks.value = props.tasks
    return
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)

  if (error) {
    console.error('❌ Failed to load tasks:', error)
    return
  }

  tasks.value = data
})
</script>

<template>
  <li
    v-for="task in filteredTasks"
    :key="task.id"
    class="task"
  >
    <ul>
      <li><input type="checkbox" /></li>
      <li><h3>{{ task.title }}</h3></li>
      <li>
        <AppButton
          text="open"
          type="open"
          :action="() => toggle(task.id)"
        />
      </li>
    </ul>
    <ul>
      <li
        :ref="el => setTaskRef(task.id, el)"
        style="height: 0; overflow: hidden;"
      >
        <ul>
          <li><p>{{ task.details }}</p></li>
          <li><h2>Posted by</h2><span>{{ task.added_by }}</span></li>
          <li><h2>Assigned to</h2><span>{{ (task.assigned_to || []).join(', ') }}</span></li>
          <li><h2>Created on</h2><span>{{ new Date(task.created_at).toLocaleDateString() }}</span></li>
          <li><h2>Updated on</h2><span>{{ new Date(task.updated_at).toLocaleDateString() }}</span></li>
        </ul>
      </li>
      <li>
        <div>
          <span class="tag" :class="{ active: task.active, resolved: !task.active }">
            {{ task.active ? 'Active' : 'Resolved' }}
          </span>
        </div>
        <AppButton
          :text="task.active ? 'Resolve' : 'Activate'"
          :type="task.active ? 'resolved' : 'active'"
          :action="() => toggleStatus(task.id)"
        />
      </li>
    </ul>
  </li>
</template>
