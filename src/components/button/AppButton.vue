<script setup>
import { h, resolveComponent } from 'vue'

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'default',
    validator: (val) =>
      ['accept', 'auth', 'submit', 'delete', 'open', 'active', 'create', 'resolved', 'delete', 'close', 'remove', 'save', 'add', 'cancel', 'default', 'toggle', 'download', 'filters'].includes(val.toLowerCase()),
  },
  action: {
    type: Function,
    required: true,
  },
  icon: {
    type: [Object, Function], // Vue component
    default: null,
  },
})

function handleClick(event) {
  if (typeof props.action === 'function') {
    props.action(event)
  } else {
    console.warn('AppButton clicked but no valid action provided')
  }
}
</script>

<template>
  <button :class="`${type.toLowerCase()}`" @click="handleClick">
    <component v-if="icon" :is="icon" class="icon" />
    {{ text }}
  </button>
</template>

<style scoped>
button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.icon {
  width: 1em;
  height: 1em;
}
</style>
