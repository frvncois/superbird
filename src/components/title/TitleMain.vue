<template>
  <li class="title">
    <h1>{{ title }}</h1>

    <AppButton
  v-if="button && typeof button.action === 'function'"
  :text="button.text"
  :type="button.type"
  :action="button.action"
/>

  </li>
</template>

  
  <script setup>
  import AppButton from '@/components/button/AppButton.vue'
  
  const props = defineProps({
  title: {
    type: String,
    required: true
  },
  button: {
    type: Object,
    default: null
  }
})


  </script>
  