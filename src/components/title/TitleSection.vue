<template>
    <li class="title">
      <h2>{{ title }}</h2>
  
      <template v-if="toggle">
        <div>?</div>
        <span>{{ toggle }}</span>
      </template>
  
      <AppButton
        v-if="button"
        :text="button.text"
        :type="button.type"
        :action="button.action"
      />
    </li>
  </template>
  
  <script setup>
  import AppButton from '@/components/button/AppButton.vue'
  
  defineProps({
    title: {
      type: String,
      required: true
    },
    toggle: {
      type: String,
      default: ''
    },
    button: {
      type: Object,
      default: null
    }
  })
  </script>
  