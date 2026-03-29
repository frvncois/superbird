<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  tabs: { label: string; value: string }[]
}>()

const active = defineModel<string>({ required: true })
const direction = ref<'left' | 'right'>('right')

function setTab(value: string) {
  const cur = props.tabs.findIndex(t => t.value === active.value)
  const next = props.tabs.findIndex(t => t.value === value)
  direction.value = next > cur ? 'right' : 'left'
  active.value = value
}

const enterFromClass = computed(() =>
  direction.value === 'right' ? 'opacity-0 translate-x-3' : 'opacity-0 -translate-x-3'
)
const leaveToClass = computed(() =>
  direction.value === 'right' ? 'opacity-0 -translate-x-3' : 'opacity-0 translate-x-3'
)
</script>

<template>
  <div>
    <!-- Tab bar -->
    <div class="flex gap-1 border-b mb-8">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        class="text-sm pb-3 px-1 mr-4 border-b-2 -mb-px transition-colors cursor-pointer"
        :class="active === tab.value
          ? 'border-foreground text-foreground font-medium'
          : 'border-transparent text-secondary hover:text-foreground'"
        @click="setTab(tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab content with directional slide-fade -->
    <div class="overflow-hidden">
      <Transition
        mode="out-in"
        :enter-from-class="enterFromClass"
        enter-active-class="transition-all duration-250 ease-out"
        enter-to-class="opacity-100 translate-x-0"
        leave-from-class="opacity-100 translate-x-0"
        leave-active-class="transition-all duration-200 ease-in"
        :leave-to-class="leaveToClass"
      >
        <div :key="active">
          <slot :name="active" />
        </div>
      </Transition>
    </div>
  </div>
</template>
