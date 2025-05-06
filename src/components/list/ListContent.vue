<script setup>
import { defineProps } from 'vue'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/lib/userStore'
import AppButton from '@/components/button/AppButton.vue'


const userStore = useUserStore()

const props = defineProps({
  items: {
    type: Array,
    required: true
  }
})

const emitEvent = defineEmits(['open'])

function openItem(item) {
  emitEvent('open', item)
}

function formatDaysAgo(date) {
  if (!date) return '—'
  const updated = new Date(date)
  const now = new Date()
  const diffTime = now - updated
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return '1 day ago'
  return `${diffDays} days ago`
}

async function deleteItem(item) {
  if (!confirm(`Are you sure you want to delete "${item.title}"?`)) return

  const { error } = await supabase
    .from('content')
    .delete()
    .eq('id', item.id)

  if (error) {
    console.error('❌ Failed to delete content:', error)
    alert('Failed to delete. Try again.')
    return
  }

  const projectId = item.project_id
  userStore.content[projectId] = userStore.content[projectId]?.filter(c => c.id !== item.id) || []

  console.log(`✅ Deleted content "${item.title}"`)
}

</script>

<template>
  <li class="content" v-for="item in items" :key="item.id">
    <ul>
      <li><input type="checkbox" /></li>
      <li><h3>{{ item.title }}</h3></li>
    </ul>
    <ul>
      <li>
        <div class="tags">
          <span class="tag">{{ formatDaysAgo(item.updated_at) }}</span>
        </div>
        <div>
          <AppButton
            text="Delete"
            type="delete"
            :action="() => deleteItem(item)"
          />
          <AppButton
            text="Open"
            type="open"
            :action="() => openItem(item)"
          />
        </div>
      </li>
    </ul>
  </li>
</template>
