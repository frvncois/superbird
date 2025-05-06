<template>
    <li class="title">
      <input v-model="titleInput" placeholder="Add title" />
  
      <template v-if="toggle">
        <div>?</div>
        <span>{{ toggle }}</span>
      </template>
  
      <AppButton
        v-if="buttonSecondary"
        :text="buttonSecondary.text"
        :type="buttonSecondary.type"
        :action="buttonSecondary.action"
      />
      <AppButton
        v-if="buttonPrimary"
        :text="buttonPrimary.text"
        :type="buttonPrimary.type"
        :action="buttonPrimary.action"
      />
    </li>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  import AppButton from '@/components/button/AppButton.vue'
  
  const props = defineProps({
    title: {
      type: String,
      required: true,
    },
    toggle: {
      type: String,
      default: '',
    },
    buttonPrimary: {
      type: Object,
      default: null,
    },
    buttonSecondary: {
      type: Object,
      default: null,
    },
  })
  
  const emit = defineEmits(['update:title'])
const titleInput = ref(props.title)

// Emit when input changes
watch(titleInput, (val) => emit('update:title', val))

// Sync input when parent updates title prop
watch(
  () => props.title,
  (val) => {
    if (val !== titleInput.value) titleInput.value = val
  }
)

  </script>
  