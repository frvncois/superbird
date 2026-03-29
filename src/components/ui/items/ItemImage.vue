<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { ArrowDownTrayIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { useAppStore, type CompressItem } from '@/stores/UseCompressStore'
import UiBadge from '@/components/ui/UiBadge.vue'

const props = defineProps<{
  item: CompressItem
}>()

const compressStore = useAppStore()
const { doneFiles } = storeToRefs(compressStore)
const { formatBytes, savings, effectiveName, downloadFile, removeItem } = compressStore

const doneIndex = computed(() => doneFiles.value.findIndex(f => f.id === props.item.id))

const displayName = computed(() =>
  props.item.status === 'done' && doneIndex.value !== -1
    ? effectiveName(props.item, doneIndex.value)
    : props.item.name
)

const ext = computed(() => props.item.name.split('.').pop()?.toUpperCase() ?? '')

const savedPct = computed(() => savings(props.item.originalSize, props.item.compressedSize))
</script>

<template>
  <div class="flex gap-3 border rounded-2xl p-1 pr-3 items-center">
    <!-- Thumbnail -->
    <div class="size-10 shrink-0 rounded-xl bg-foreground/5 overflow-hidden">
      <img v-if="item.thumbnail" :src="item.thumbnail" class="size-full object-cover" />
    </div>

    <!-- Info -->
    <div class="flex-1 min-w-0">
      <!-- Skeleton -->
      <template v-if="item.status === 'converting'">
        <div style="animation: superbird-skeleton-pulse 1.8s ease-in-out infinite">
          <div class="h-3.5 w-32 rounded bg-foreground/10 mb-1.5" />
          <div class="h-2.5 w-24 rounded bg-foreground/10" />
        </div>
      </template>

      <!-- Staged -->
      <template v-else-if="item.status === 'staged'">
        <h3 class="text-sm truncate">{{ item.name }}</h3>
        <div class="text-[10px] font-mono uppercase text-secondary space-x-2">
          <span>{{ item.originalWidth }} x {{ item.originalHeight }}</span>
          <span>·</span>
          <span>{{ formatBytes(item.originalSize) }}</span>
        </div>
      </template>

      <!-- Done -->
      <template v-else>
        <h3 class="text-sm truncate">{{ displayName }}</h3>
        <div class="text-[10px] font-mono uppercase text-secondary">
          {{ formatBytes(item.originalSize) }} → {{ formatBytes(item.compressedSize) }}
        </div>
      </template>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-2 shrink-0">
      <template v-if="item.status === 'done'">
        <UiBadge :label="`-${savedPct}%`" color="green" />
        <UiBadge :label="ext" color="light" />
        <button class="p-1.5 rounded-lg hover:bg-foreground/5 text-secondary hover:text-foreground transition-colors cursor-pointer" @click="downloadFile(item)">
          <ArrowDownTrayIcon class="size-4" />
        </button>
      </template>
      <button class="p-1.5 rounded-lg hover:bg-red-bg text-secondary hover:text-red-strong transition-colors cursor-pointer" @click="removeItem(item.id)">
        <TrashIcon class="size-4" />
      </button>
    </div>
  </div>
</template>
