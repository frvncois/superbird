<script setup lang="ts">
import { MagnifyingGlassIcon, PhotoIcon, GlobeAltIcon, PlayIcon } from '@heroicons/vue/24/outline'
import UiCard from './ui/UiCard.vue'
import { useRouteLeave } from '@/composables/useRouteLeave'

const leaving = useRouteLeave()

const delays = [250, 300, 350, 400]

function cardStyle(i: number) {
  return leaving.value
    ? { animation: `superbird-fade-out 0.25s ease both` }
    : { animation: `superbird-fade-in-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${delays[i]}ms both` }
}
</script>

<template>
  <section>
    <div class="grid grid-cols-2 gap-3">
      <UiCard
        :icon="MagnifyingGlassIcon"
        title="Scan Website"
        description="Full Lighthouse audit — performance, SEO, accessibility and core web vitals."
        :badges="['Performance', 'SEO', 'Accessibility']"
        to="/scan"
        :style="cardStyle(0)"
      />
      <UiCard
        :icon="PhotoIcon"
        title="Compress Images"
        description="Resize and convert images to WebP, JPEG or PNG directly in your browser."
        :badges="['Format', 'Size', 'Compress', 'Prefix']"
        to="/compress"
        :style="cardStyle(1)"
      />
      <UiCard
        :icon="GlobeAltIcon"
        title="Check DNS"
        description="Inspect propagation of A, MX, TXT, CNAME and more in one shot."
        :badges="['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS']"
        to="/dns"
        :style="cardStyle(2)"
      />
      <UiCard
        :icon="PlayIcon"
        title="Test API"
        description="Fetch any public endpoint and explore the JSON response in a collapsible tree view."
        :badges="['GET', 'POST', 'PUT', 'DELETE', 'HEAD']"
        to="/api"
        :style="cardStyle(3)"
      />
    </div>
  </section>
</template>
