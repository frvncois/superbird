<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useDnsStore } from '@/stores/useDnsStore'
import { RECORD_TYPES, TYPE_META } from '@/utils/dns'
import UiBadge from './ui/UiBadge.vue'
import ItemDns from './ui/items/ItemDns.vue'

const { results, status } = storeToRefs(useDnsStore())

const TYPE_COLORS: Record<string, 'blue' | 'purple' | 'orange' | 'red' | 'green' | 'dark'> = {
  A:     'blue',
  AAAA:  'purple',
  CNAME: 'orange',
  MX:    'red',
  TXT:   'green',
  NS:    'dark',
  CAA:   'red',
  SOA:   'orange',
}
</script>

<template>
  <section class="space-y-3" v-if="status === 'done' && results">
    <template v-for="(type, idx) in RECORD_TYPES" :key="type">
      <div
        v-if="results[type]?.records?.length"
        class="border rounded-2xl overflow-hidden"
        :style="`animation: superbird-fade-in-up 0.5s ease both; animation-delay: ${idx * 70}ms`"
      >
        <div class="flex items-center gap-3 bg-secondary/5 p-3 border-b text-xs">
          <UiBadge :label="type" :color="TYPE_COLORS[type]" />
          <span class="text-secondary/75">{{ TYPE_META[type]?.label }}</span>
          <UiBadge :label="String(results[type].records.length)" color="light" class="ml-auto" />
        </div>
        <ItemDns
          v-for="(record, i) in results[type].records"
          :key="i"
          :record="record"
          :type="type"
        />
      </div>
    </template>
  </section>
</template>
