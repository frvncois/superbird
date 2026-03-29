<script setup lang="ts">
type Size = 'default' | 'sm'
type Variant = 'default' | 'lookup'

withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    type?: string
    disabled?: boolean
    size?: Size
    variant?: Variant
  }>(),
  {
    type: 'text',
    disabled: false,
    size: 'default',
    variant: 'default',
  },
)

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <input
    :value="modelValue"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    :class="[
      'w-full bg-transparent text-foreground placeholder:text-foreground/40 disabled:pointer-events-none disabled:opacity-50',
      variant === 'default' && 'border border-foreground/15 focus:border-foreground/40 focus:outline-2 focus:outline-foreground/10 transition-colors',
      variant === 'lookup' && 'border-none outline-none',
      {
        'h-12 px-3 text-sm rounded-2xl': size === 'default' && variant === 'default',
        'h-8 px-2.5 text-xs': size === 'sm',
        'px-3 text-sm': variant === 'lookup',
      },
    ]"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
