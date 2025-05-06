<template>
    <li class="input">
      <label>{{ label }}</label>
      <div>
        <button @click="button.action()" :class="button.type">
          {{ button.text }}
        </button>
        <p>{{ note }}</p>
      </div>
    </li>
  </template>
  
  <script setup>
  import { defineProps } from 'vue'
  
  const props = defineProps({
    label: {
      type: String,
      default: ''
    },
    note: {
      type: String,
      default: ''
    },
    button: {
      type: Object,
      required: true
    }
  })
  </script>
  