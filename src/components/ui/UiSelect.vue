<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  options: string[]
}>()

const model = defineModel<string>()

const selectedIndex = computed(() =>
  props.options.indexOf(model.value ?? props.options[0] ?? '')
)
</script>

<template>
  <div class="relative inline-flex w-full rounded-xl bg-foreground/5 p-1">
    <span
      class="absolute top-1 bottom-1 rounded-lg bg-background shadow transition-all duration-200 ease-in-out"
      :style="{
        left: `calc(${selectedIndex} * (100% - 8px) / ${options.length} + 4px)`,
        width: `calc((100% - 8px) / ${options.length})`,
      }"
    />
    <button
      v-for="option in options"
      :key="option"
      class="relative z-10 flex-1 py-1.5 text-sm rounded-lg transition-colors duration-200 cursor-pointer"
      :class="model === option ? 'text-foreground font-medium' : 'text-secondary'"
      @click="model = option"
    >
      {{ option }}
    </button>
  </div>
</template>
