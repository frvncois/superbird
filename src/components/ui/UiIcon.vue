<script setup lang="ts">
import { shallowRef, watchEffect, type Component } from 'vue'

type Size = 'default' | 'large'
type Style = 'outline' | 'solid' | 'mini'
type Variant = 'default' | 'circle'

const props = withDefaults(
  defineProps<{
    icon: string | Component
    size?: Size
    style?: Style
    variant?: Variant
  }>(),
  {
    size: 'default',
    style: 'outline',
    variant: 'default',
  },
)

const folderMap: Record<Style, string> = {
  outline: '24/outline',
  solid: '24/solid',
  mini: '20/solid',
}

const IconComponent = shallowRef<Component | null>(null)

const VALID_ICON_NAME = /^[A-Z][A-Za-z]+Icon$/

watchEffect(async () => {
  if (typeof props.icon !== 'string') {
    IconComponent.value = props.icon
    return
  }
  if (!VALID_ICON_NAME.test(props.icon)) {
    IconComponent.value = null
    return
  }
  const module = await import(`@heroicons/vue/${folderMap[props.style]}`)
  IconComponent.value = (module as Record<string, Component>)[props.icon] ?? null
})
</script>

<template>
  <span
    :class="[
      'inline-flex items-center justify-center shrink-0 bg-icon-bg text-icon-txt',
      {
        'size-8 p-2 rounded-xl': size === 'default' && variant === 'default',
        'size-14 p-4 rounded-2xl': size === 'large' && variant === 'default',
        'size-16 p-4 rounded-full': size === 'default' && variant === 'circle',
        'size-18 p-6 rounded-full': size === 'large' && variant === 'circle',
      },
    ]"
  >
    <component :is="IconComponent" />
  </span>
</template>
