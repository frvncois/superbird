<template>
    <li class="toggle">
      <div>
        <label>{{ label }}</label>
        <p>{{ note }}</p>
      </div>
      <label>
        <input
          type="checkbox"
          :checked="modelValue"
          @change="$emit('update:modelValue', $event.target.checked)"
        />
      </label>
    </li>
  </template>
  
  <script setup>
  defineProps({
    label: {
      type: String,
      required: true
    },
    note: {
      type: String,
      default: ''
    },
    modelValue: {
      type: Boolean,
      default: false
    }
  })
  
  defineEmits(['update:modelValue'])
  </script>
  