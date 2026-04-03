<script setup lang="ts">
type Color = 'green' | 'blue' | 'purple' | 'red' | 'yellow' | 'orange' | 'dark' | 'light'

withDefaults(
  defineProps<{
    label: string
    color?: Color
  }>(),
  {
    color: 'light',
  },
)
</script>

<template>
  <h3
    :class="[
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider',
      {
        'bg-green-bg text-green-fg':     color === 'green',
        'bg-blue-bg text-blue-fg':       color === 'blue',
        'bg-purple-bg text-purple-fg':   color === 'purple',
        'bg-red-bg text-red-fg':         color === 'red',
        'bg-yellow-bg text-yellow-fg':   color === 'yellow',
        'bg-orange-bg text-orange-fg':   color === 'orange',
        'bg-foreground text-background': color === 'dark',
        'bg-muted-bg text-muted-fg':     color === 'light',
      },
    ]"
  >
    <span class="size-1.5 rounded-full bg-current opacity-50 shrink-0"></span>
    {{ label }}
  </h3>
</template>
