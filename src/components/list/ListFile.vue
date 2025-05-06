<script setup>
import { defineProps } from 'vue'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/lib/userStore'

const props = defineProps({
  items: {
    type: Array,
    required: true
  }
})

defineEmits(['open'])

const userStore = useUserStore()

async function deleteContent(id) {
  const file = props.items.find(f => f.id === id)
  if (!file) {
    console.error('❌ File not found in props.items')
    return
  }

  const path = file.path

  console.log('🗑 Deleting file from storage:', path)

  const { error: storageError } = await supabase
    .storage
    .from('projects-files')
    .remove([path])

  if (storageError) {
    console.error('❌ Supabase Storage error:', storageError)
    return
  }

  console.log('✅ Deleted from storage')

  const { error: dbError } = await supabase
    .from('files')
    .delete()
    .eq('id', file.id)

  if (dbError) {
    console.error('❌ Supabase DB error:', dbError)
    return
  }

  userStore.files[file.project_id] = userStore.files[file.project_id].filter(f => f.id !== id)

  console.log('✅ Deleted from DB and removed from store')
}

</script>

<template>
  <li class="file" v-for="item in items" :key="item.id">
    <ul>
      <li><input type="checkbox" /></li>
      <li><h3>{{ item.name }}</h3></li>
    </ul>
    <ul>
      <li>
        <div class="tags">
          <span class="tag">{{ item.mime_type }}</span>
        </div>
        <div>
          <button @click="deleteContent(item.id)">Delete</button>
          <button :href="`https://YOUR-SUPABASE-URL/storage/v1/object/public/projects-files/${item.path}`" target="_blank">Open</button>
        </div>
      </li>
    </ul>
  </li>
</template>
