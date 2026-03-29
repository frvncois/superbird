<script setup lang="ts">
import { RouterLink, useRoute, type RouteLocationRaw } from 'vue-router'
import { computed } from 'vue'

type Variant = 'default' | 'outline' | 'ghost'
type Size = 'default' | 'md' | 'sm' | 'xs'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    size?: Size
    disabled?: boolean
    to?: RouteLocationRaw
  }>(),
  {
    variant: 'default',
    size: 'default',
    disabled: false,
  },
)

const tag = computed(() => (props.to ? RouterLink : 'button'))

const route = useRoute()
const active = computed(() => !!props.to && route.path === props.to)
</script>

<template>
  <component
    :is="tag"
    :to="to"
    :disabled="tag === 'button' ? disabled : undefined"
    style="transition: background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease, opacity 0.25s ease"
    :class="[
      'inline-flex items-center justify-center font-medium cursor-pointer gap-1.5',
      'focus-visible:outline-2 focus-visible:outline-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      {
        // Sizes
        'h-12 px-6 text-sm rounded-2xl': size === 'default',
        'h-9 px-4 text-sm rounded-xl': size === 'md',
        'h-7 px-3 text-xs rounded-xl': size === 'sm',
        'h-6 px-2 text-[10px] rounded-lg': size === 'xs',
        // Variants
        'bg-black text-white hover:bg-black/85 focus-visible:outline-black': variant === 'default',
        'bg-transparent border text-foreground hover:bg-foreground/5 focus-visible:outline-black': variant === 'outline' && !active,
        'bg-transparent text-foreground hover:bg-foreground/5 focus-visible:outline-black': variant === 'ghost' && !active,
        // Active
        'bg-foreground text-background': active && variant === 'ghost',
        'bg-foreground/10 border-foreground/30 text-foreground': active && variant === 'outline',
      },
    ]"
  >
    <slot />
  </component>
</template>
