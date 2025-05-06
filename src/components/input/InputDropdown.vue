<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  label: String,
  placeholder: String,
  options: Array,
  name: String,
  multiple: Boolean,
  modelValue: {
    type: [Array, String],
    default: () => [],
  }
})
const emit = defineEmits(['update:modelValue'])

const dropdown = ref(null)

const selectedValue = ref(props.modelValue)

const selectedDisplay = computed(() => {
  if (props.multiple) {
    return props.options
      .filter(opt => selectedValue.value.includes(opt.value))
      .map(opt => opt.label)
      .join(', ')
  } else {
    const found = props.options.find(opt => opt.value === selectedValue.value)
    return found?.label || ''
  }
})

const selectOption = (option) => {
  const value = option.value
  if (props.multiple) {
    if (selectedValue.value.includes(value)) {
      selectedValue.value = selectedValue.value.filter(v => v !== value)
    } else {
      selectedValue.value = [...selectedValue.value, value]
    }
  } else {
    selectedValue.value = value
  }

  emit('update:modelValue', selectedValue.value)
}

const isChecked = (option) => {
  if (props.multiple) {
    return selectedValue.value.includes(option.value)
  } else {
    return selectedValue.value === option.value
  }
}

const toggleOpen = () => {
  const allDropdowns = document.querySelectorAll('ul[data-type="select"]')
  allDropdowns.forEach((ul) => {
    const items = ul.querySelectorAll('li:not(:first-child)')
    if (ul !== dropdown.value) {
      items.forEach((item) => (item.style.maxHeight = '0'))
      setTimeout(() => {
        ul.style.zIndex = '10'
      }, 10)
    }
  })

  if (!dropdown.value) return
  const currentItems = dropdown.value.querySelectorAll('li:not(:first-child)')
  const isOpen = currentItems[0].style.maxHeight !== '0px' && currentItems[0].style.maxHeight !== ''

  if (isOpen) {
    currentItems.forEach((item) => (item.style.maxHeight = '0'))
    setTimeout(() => {
      dropdown.value.style.zIndex = '10'
    }, 300)
  } else {
    currentItems.forEach((item) => (item.style.maxHeight = item.scrollHeight + 'px'))
    dropdown.value.style.zIndex = '20'
  }
}

onMounted(() => {
  if (dropdown.value) dropdown.value.style.zIndex = '10'
})
</script>

<template>
  <li class="input">
    <label>{{ label }}</label>
    <div>
      <input type="text" :value="selectedDisplay" :placeholder="placeholder" readonly />
      <ul data-type="select" ref="dropdown">
        <li @click="toggleOpen">
          <label>{{ selectedDisplay || placeholder }}</label>
        </li>
        <li v-for="(option, index) in options" :key="index">
          <label>
            <input
              :type="multiple ? 'checkbox' : 'radio'"
              :name="name"
              :value="option.value"
              :checked="isChecked(option)"
              @click.stop="selectOption(option)"
            />
            {{ option.label }}
          </label>
        </li>
      </ul>
    </div>
  </li>
</template>

<style scoped>
input[type="text"] {
  opacity: 0;
}
</style>
