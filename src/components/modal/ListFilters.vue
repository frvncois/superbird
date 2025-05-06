<script setup>
import InputDropdown from '@/components/input/InputDropdown.vue'
import InputToggle from '@/components/input/InputToggle.vue'

const props = defineProps({
  toggles: {
    type: Array,
    required: true 
  },
  filters: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="options">
    <form>
      <InputToggle
        v-for="key in toggles"
        :key="key"
        :label="key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')"
        v-model="filters[key]"
      />
      <InputDropdown
        label="Sort by"
        placeholder="Newest"
        :options="['Newest', 'Oldest']"
        :multiple="false"
        v-model="filters.sort"
      />
    </form>
  </div>
</template>
