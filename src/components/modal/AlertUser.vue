<template>
    <div v-if="show" class="alert">
      <p>{{ message }}</p>
      <button @click="close">OK</button>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  
  const props = defineProps({
    message: String,
    show: Boolean
  })
  const emit = defineEmits(['close'])
  
  function close() {
    emit('close')
  }
  </script>
  