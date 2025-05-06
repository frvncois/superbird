<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/lib/userStore'
import InputNormal from '@/components/input/InputNormal.vue'

const emit = defineEmits(['close', 'confirm'])
const props = defineProps({
  project: {
    type: Object,
    required: true
  }
})

onMounted(() => {
  console.log('DeleteProject modal mounted with project:', props.project)
})

const userStore = useUserStore()
const confirmText = ref('')
const isDeleting = ref(false)

const isOwner = computed(() => {
  const isOwnerCheck = userStore.user?.id === props.project?.owner_id
  console.log('Owner check:', isOwnerCheck, 'User ID:', userStore.user?.id, 'Project owner:', props.project?.owner_id)
  return isOwnerCheck
})

const canDelete = computed(() => {
  const canDeleteCheck = isOwner.value && confirmText.value.trim().toLowerCase() === 'delete'
  console.log('Can delete check:', canDeleteCheck, 'Confirm text:', confirmText.value)
  return canDeleteCheck
})

async function handleDelete() {
  console.log('Handle delete clicked')
  
  if (!isOwner.value) {
    console.error('Not the project owner')
    alert('Only the project owner can delete this project.')
    return
  }

  if (!canDelete.value) {
    console.error('Invalid confirmation text')
    alert('Type "delete" to confirm.')
    return
  }

  isDeleting.value = true
  console.log('Emitting confirm event for project deletion')
  
  emit('confirm')
  emit('close')
}
</script>

<template>
    <div class="modal">
      <div class="wrap">
        <h1>Delete project</h1>
        <ul class="list">
          <li><h2>{{ project.title }}</h2></li>
          <li><p>This action is permanent. Only the project owner can delete this project.</p></li>
  
          <template v-if="isOwner">
            <li>
              <InputNormal
                label="Type delete to confirm"
                placeholder="delete"
                v-model="confirmText"
              />
            </li>
            <li class="buttons">
              <button 
                class="delete-btn" 
                :disabled="!canDelete || isDeleting" 
                @click="handleDelete"
              >
                {{ isDeleting ? 'Deleting...' : 'Delete' }}
              </button>
              <button 
                class="cancel-btn" 
                @click="$emit('close')"
                :disabled="isDeleting"
              >
                Cancel
              </button>
            </li>
          </template>
  
          <template v-else>
            <li class="not-owner-msg">
              <p>You are not the owner of this project and cannot delete it.</p>
            </li>
            <li class="buttons">
              <button class="cancel-btn" @click="$emit('close')">Close</button>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </template>
  