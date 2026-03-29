<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores/UseCompressStore'
import ItemImage from './ui/items/ItemImage.vue'
import UiButton from '@/components/ui/UiButton.vue'

const LIMIT = 5
const expanded = ref(false)
const compressStore = useAppStore()
const { items } = storeToRefs(compressStore)
const { clearList } = compressStore

const hasMore = computed(() => items.value.length > LIMIT)
const visibleItems = computed(() => expanded.value ? items.value : items.value.slice(0, LIMIT))
</script>

<template>
  <div v-if="items.length">
    <div class="relative">
      <div
        class="overflow-hidden transition-all duration-500 ease-in-out space-y-1"
        :style="!expanded && hasMore ? 'max-height: 320px' : 'max-height: 2000px'"
      >
        <ItemImage
          v-for="(item, i) in visibleItems"
          :key="item.id"
          :item="item"
          :style="`animation: superbird-fade-in-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${i * 60}ms both`"
        />
      </div>
      <Transition
        enter-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-300"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="hasMore && !expanded" class="absolute inset-x-0 bottom-0 h-28 pointer-events-none">
          <div class="absolute inset-0" style="backdrop-filter: blur(10px); -webkit-mask-image: linear-gradient(to bottom, transparent 60%, black 100%); mask-image: linear-gradient(to bottom, transparent 60%, black 100%)" />
          <div class="absolute inset-0" style="background: linear-gradient(to bottom, transparent 30%, var(--color-background) 100%)" />
        </div>
      </Transition>
    </div>

    <div class="flex justify-between items-center mt-3">
      <UiButton v-if="hasMore" variant="ghost" size="sm" @click="expanded = !expanded">
        {{ expanded ? 'See less' : `See all (${items.length})` }}
      </UiButton>
      <div v-else class="flex-1" />
      <UiButton variant="outline" size="sm" @click="clearList">Clear</UiButton>
    </div>

  </div>
</template>
