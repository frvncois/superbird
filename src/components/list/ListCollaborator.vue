<template>
    <li class="collaborator">
      <ul>
        <li><input type="checkbox" /></li>
        <li>
          <h3>
            {{ user.name }}
          </h3>
        </li>
      </ul>
  
      <ul>
        <li>
        <div>
          <span class="tag">{{ user.email }}</span>

        </div>
        <div>
          <AppButton
              text="Add"
              type="add"
              :action="addCollaborator"
            />
        </div>
      </li>
      </ul>
    </li>
  </template>
  
  <script setup>
  import AppButton from '@/components/button/AppButton.vue'
  const props = defineProps({
    user: {
      type: Object,
      required: true
    },
    addCollaborator: {
      type: Function,
      required: true
    }
  })
  </script>