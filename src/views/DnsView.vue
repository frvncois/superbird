<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { useDnsStore } from '@/stores/useDnsStore'
import SharedIntro from '@/components/shared/SharedIntro.vue'
import UiLookup from '@/components/ui/UiLookup.vue'
import DnsList from '@/components/DnsList.vue'
import DnsSkeleton from '@/components/skeletons/DnsSkeleton.vue'
import { useRouteLeave } from '@/composables/useRouteLeave'

const dnsStore = useDnsStore()
const { domain, status, errorMessage } = storeToRefs(dnsStore)
const { check } = dnsStore

const buttonLabel = computed(() => status.value === 'done' ? 'Recheck' : 'Check')
const leaving = useRouteLeave()
</script>

<template>
  <SharedIntro
    title="Check DNS"
    description="Inspect propagation of A, MX, TXT, CNAME and more in one shot."
  />
  <UiLookup
    v-model="domain"
    placeholder="Enter a domain..."
    :buttonIcon="MagnifyingGlassIcon"
    :buttonLabel="buttonLabel"
    loadingLabel="Checking…"
    :loading="status === 'loading'"
    :onAction="check"
  />

  <div class="relative mt-2">
    <!-- Skeleton (idle + loading) -->
    <Transition
      leave-active-class="absolute inset-x-0 top-0 transition-opacity duration-500 pointer-events-none"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
    >
      <DnsSkeleton
        v-if="status === 'idle' || status === 'loading'"
        :loading="status === 'loading'"
      />
    </Transition>

    <!-- Error -->
    <Transition
      enter-active-class="transition-opacity duration-400"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
    >
      <div
        v-if="status === 'error'"
        class="border border-red-border bg-red-bg rounded-2xl p-4 text-xs text-red-fg"
      >
        {{ errorMessage }}
      </div>
    </Transition>

    <!-- Real content (done) -->
    <Transition
      enter-active-class="transition-opacity duration-600"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
    >
      <DnsList v-if="status === 'done'" :style="leaving ? { animation: 'superbird-fade-out 0.25s ease both' } : {}" />
    </Transition>
  </div>
</template>
