<script setup lang="ts">
defineProps<{
  text: string
}>()

const model = defineModel<boolean>({ default: false })
</script>

<template>
  <label class="inline-flex items-center gap-2.5 cursor-pointer select-none">
    <span class="text-[10px] font-mono uppercase text-foreground">{{ text }}</span>
    <button
      role="switch"
      :aria-checked="model"
      :class="[
        'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200',
        model ? 'bg-foreground' : 'bg-foreground/20',
      ]"
      @click="model = !model"
    >
      <span
        :class="[
          'pointer-events-none inline-block size-4 rounded-full bg-background shadow transition-transform duration-200',
          model ? 'translate-x-4' : 'translate-x-0',
        ]"
      />
    </button>
  </label>
</template>
