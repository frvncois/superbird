<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import UiButton from '@/components/ui/UiButton.vue'
import SuperbirdIcon from '@/assets/SuperbirdIcon.vue'

const route = useRoute()
const isHome = computed(() => route.path === '/')
</script>

<template>
  <header class="flex justify-between py-8 group">
    <RouterLink to="/" class="flex items-center">
      <div
        class="overflow-hidden transition-all duration-200"
        :class="isHome ? 'w-0 mr-0 group-hover:w-6 group-hover:mr-3' : 'w-6 mr-3'"
      >
        <SuperbirdIcon
          class="size-6 shrink-0 transition-opacity duration-200"
          :class="isHome ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'"
        />
      </div>
      <h1 class="font-semibold">Superbird</h1>
    </RouterLink>
    <nav class="space-x-1.5">
      <UiButton variant="ghost" size="sm" to="/scan">Scan</UiButton>
      <UiButton variant="ghost" size="sm" to="/compress">Compress</UiButton>
      <UiButton variant="ghost" size="sm" to="/dns">DNS</UiButton>
      <UiButton variant="ghost" size="sm" to="/api">API</UiButton>
    </nav>
  </header>
</template>
