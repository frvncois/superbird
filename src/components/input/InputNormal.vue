<template>
    <li class="input">
      <label :for="name">{{ label }}</label>
      <div data-type="text">
        <input
          :id="name"
          :name="name"
          :type="type"
          :placeholder="placeholder"
          :required="required"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
        />
        <p>{{ note }}</p>
      </div>
    </li>
  </template>
  
  <script setup>
  defineProps({
    label: {
      type: String,
      required: true
    },
    placeholder: {
      type: String,
      required: true
    },
    note: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    modelValue: {
      type: String,
      default: ''
    },
    required: {
      type: Boolean,
      default: false
    }
  })
  
  defineEmits(['update:modelValue'])
  </script>
  