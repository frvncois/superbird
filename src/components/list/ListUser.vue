<template>
  <li class="user">
    <ul>
      <li><input type="checkbox" /></li>
      <li>
        <h3>
          {{ user.name }}
        </h3>
      </li>
      <li><button @click="toggle">⋮</button></li>
    </ul>

    <ul>
      <!-- Expandable Section -->
      <li ref="userRef" style="height: 0; overflow: hidden;">
        <ul>
          <li v-if="user.type !== 'pending'">
            <h2>Assigned to</h2>
            <div ref="projects">
              <AppButton
                v-for="i in 3"
                :key="i"
                :text="`Project name ${i}`"
                type="download"
                :action="() => router.push('/task')"
              />
            </div>
          </li>

          <li>
            <h2>Email</h2>
            <span>{{ user.email }}</span>
          </li>

          <li v-if="user.joined">
            <h2>Last activity</h2>
            <span>{{ user.joined }}</span>
          </li>

          <li v-if="user.lastActivity">
            <h2>Joined on</h2>
            <span>{{ user.lastActivity }}</span>
          </li>
        </ul>
      </li>

      <li>
        <div>
          <span
            :class="['tag', user.type === 'pending' ? 'pending' : '']"
          >
            {{ user.type === 'pending' ? 'Pending' : projectCount + ' projects' }}
          </span>

        </div>
        <div>
          <AppButton
            text="Remove"
            type="remove"
            :action="removeCollaborator"
          />
        </div>
      </li>
    </ul>
  </li>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '@/components/button/AppButton.vue'

import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/lib/userStore'

const userStore = useUserStore()

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['remove'])

const router = useRouter()
const isOpen = ref(false)
const userRef = ref(null)
const projects = ref(null)
const projectCount = ref(0)

function toggle() {
  if (!userRef.value) return
  const el = userRef.value

  if (isOpen.value) {
    const currentHeight = el.scrollHeight
    el.style.height = currentHeight + 'px'

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
    const targetHeight = el.scrollHeight
    el.style.height = '0px'

    requestAnimationFrame(() => {
      el.style.transition = 'height 300ms ease'
      el.style.height = targetHeight + 'px'
    })

    el.addEventListener('transitionend', function handler() {
      el.style.transition = ''
      el.style.height = 'auto'
      el.removeEventListener('transitionend', handler)
    })
  }

  isOpen.value = !isOpen.value
}

async function removeCollaborator() {
  emit('remove') // Instantly remove from UI

  if (props.user.type === 'collaborator') {
    const { error } = await supabase
      .from('collaborators')
      .delete()
      .match({
        user_id: userStore.user.id,
        collaborator_id: props.user.id
      })

    if (error) {
      console.error('❌ Failed to remove collaborator from DB:', error)
    }
  }

  if (props.user.type === 'pending') {
    const { error } = await supabase
      .from('pending_users')
      .delete()
      .match({
        id: props.user.id,
        invited_by: userStore.user.id // ✅ prevent removing someone else’s invite
      })

    if (error) {
      console.error('❌ Failed to remove pending user from DB:', error)
    }
  }
}

onMounted(() => {
  nextTick(() => {
    if (projects.value) {
      projectCount.value = projects.value.querySelectorAll('button').length
    }
  })
})
</script>