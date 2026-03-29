<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useScanStore } from '@/stores/useScanStore'
import UiBadge from './ui/UiBadge.vue'
import ItemScan from './ui/items/ItemScan.vue'
import UiMinis from './ui/UiMinis.vue'

const { status, vitals, opportunities, diagnostics, passedAudits, seoAudits } = storeToRefs(useScanStore())
</script>

<template>
  <section v-if="status === 'done'" class="space-y-3">

    <!-- Core Web Vitals -->
    <UiMinis
      :vitals="vitals"
      style="animation: superbird-fade-in-up 0.5s ease both; animation-delay: 0ms"
    />

    <!-- Opportunities -->
    <div
      v-if="opportunities.length"
      class="border rounded-2xl overflow-hidden"
      style="animation: superbird-fade-in-up 0.5s ease both; animation-delay: 80ms"
    >
      <div class="flex items-center gap-3 bg-secondary/5 p-3 border-b text-xs">
        <UiBadge label="Opportunities" color="red" />
        <span class="text-secondary/75">Optimisations with estimated savings</span>
        <UiBadge :label="String(opportunities.length)" color="light" class="ml-auto" />
      </div>
      <ItemScan
        v-for="opp in opportunities"
        :key="opp.id"
        :title="opp.title"
        :value="opp.displayValue"
        :description="opp.description"
        :score="opp.score"
        :details="opp.details"
      />
    </div>

    <!-- Diagnostics -->
    <div
      v-if="diagnostics.length"
      class="border rounded-2xl overflow-hidden"
      style="animation: superbird-fade-in-up 0.5s ease both; animation-delay: 160ms"
    >
      <div class="flex items-center gap-3 bg-secondary/5 p-3 border-b text-xs">
        <UiBadge label="Diagnostics" color="yellow" />
        <span class="text-secondary/75">More information about your page</span>
        <UiBadge :label="String(diagnostics.length)" color="light" class="ml-auto" />
      </div>
      <ItemScan
        v-for="diag in diagnostics"
        :key="diag.title"
        :title="diag.title"
        :value="diag.displayValue"
        :score="diag.score"
        :details="diag.details"
      />
    </div>

    <!-- SEO -->
    <div
      v-if="seoAudits.length"
      class="border rounded-2xl overflow-hidden"
      style="animation: superbird-fade-in-up 0.5s ease both; animation-delay: 240ms"
    >
      <div class="flex items-center gap-3 bg-secondary/5 p-3 border-b text-xs">
        <UiBadge label="SEO" color="blue" />
        <span class="text-secondary/75">Search engine optimisation audits</span>
        <UiBadge :label="String(seoAudits.length)" color="light" class="ml-auto" />
      </div>
      <ItemScan
        v-for="audit in seoAudits"
        :key="audit.id"
        :title="audit.title"
        :value="audit.displayValue"
        :description="audit.description"
        :score="audit.score"
        :details="audit.details"
      />
    </div>

    <!-- Passed Audits -->
    <div
      v-if="passedAudits.length"
      class="border rounded-2xl overflow-hidden"
      style="animation: superbird-fade-in-up 0.5s ease both; animation-delay: 320ms"
    >
      <div class="flex items-center gap-3 bg-secondary/5 p-3 border-b text-xs">
        <UiBadge label="Passed" color="green" />
        <span class="text-secondary/75">Audits that require no action</span>
        <UiBadge :label="String(passedAudits.length)" color="light" class="ml-auto" />
      </div>
      <ItemScan
        v-for="audit in passedAudits"
        :key="audit.id"
        :title="audit.title"
        :description="audit.description"
        :score="1"
      />
    </div>

  </section>
</template>
