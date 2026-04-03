<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { PaperAirplaneIcon, ClipboardDocumentIcon, ClipboardDocumentCheckIcon } from '@heroicons/vue/24/outline'
import { useApiStore } from '@/stores/useApiStore'
import SharedIntro from '@/components/shared/SharedIntro.vue'
import UiLookup from '@/components/ui/UiLookup.vue'
import UiMethodSelect from '@/components/ui/UiMethodSelect.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiTooltip from '@/components/ui/UiTooltip.vue'
import ApiSkeleton from '@/components/skeletons/ApiSkeleton.vue'
import ApiHeaders from '@/components/ApiHeaders.vue'
import { useRouteLeave } from '@/composables/useRouteLeave'

const apiStore = useApiStore()
const { url, method, body, hasBody, status, responseStatus, responseTime, responseBody, errorMessage } = storeToRefs(apiStore)
const { send } = apiStore

const buttonLabel = computed(() => status.value === 'done' ? 'Resend' : 'Send')
const leaving = useRouteLeave()

const statusColor = computed(() => {
  const s = responseStatus.value
  if (s == null) return 'light'
  if (s < 300) return 'green'
  if (s < 400) return 'blue'
  if (s < 500) return 'yellow'
  return 'red'
})

const copied = ref(false)
function copy() {
  navigator.clipboard.writeText(responseBody.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

const isJson = computed(() => {
  const b = responseBody.value.trimStart()
  return b.startsWith('{') || b.startsWith('[')
})
</script>

<template>
  <SharedIntro
    title="API Tester (REST Client)"
    description="Send GET, POST, PUT and DELETE requests and inspect JSON responses in a structured view. No setup, no accounts, completely free."
  />

  <UiLookup
    v-model="url"
    placeholder="https://api.example.com/endpoint"
    :buttonIcon="PaperAirplaneIcon"
    :buttonLabel="buttonLabel"
    loadingLabel="Sending…"
    :loading="status === 'loading'"
    :onAction="send"
    historyKey="api"
  >
    <template #leading>
      <UiMethodSelect v-model="method" flat />
    </template>
  </UiLookup>

  <ApiHeaders />

  <!-- Body (POST / PUT / PATCH) -->
  <div v-if="hasBody" class="border rounded-2xl overflow-hidden">
    <div class="bg-secondary/5 p-3 border-b text-xs">
      <span class="font-medium text-secondary">Body</span>
      <span class="ml-2 text-secondary/40">JSON</span>
    </div>
    <textarea
      v-model="body"
      placeholder='{ "key": "value" }'
      class="w-full p-4 text-xs font-mono bg-transparent outline-none resize-none min-h-[120px] placeholder:text-secondary/30"
    />
  </div>

  <!-- Skeleton / Response / Error -->
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
      <ApiSkeleton
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

    <!-- Response (done) -->
    <Transition
      enter-active-class="transition-opacity duration-600"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
    >
      <div v-if="status === 'done'" class="border rounded-2xl overflow-hidden" :style="leaving ? { animation: 'superbird-fade-out 0.25s ease both' } : {}"  >
        <div class="flex items-center gap-3 bg-secondary/5 p-3 border-b text-xs">
          <span class="font-medium text-secondary">Response</span>
          <UiBadge v-if="responseStatus" :label="String(responseStatus)" :color="statusColor" />
          <span v-if="responseTime !== null" class="text-secondary/60 font-mono">{{ responseTime }} ms</span>
          <UiTooltip label="Copied!" :show="copied" class="ml-auto">
            <button type="button" class="text-secondary/40 hover:text-secondary transition-colors cursor-pointer" @click="copy">
              <ClipboardDocumentCheckIcon v-if="copied" class="size-3.5" />
              <ClipboardDocumentIcon v-else class="size-3.5" />
            </button>
          </UiTooltip>
        </div>
        <pre
          class="p-4 text-xs font-mono leading-relaxed overflow-x-auto max-h-[60vh] whitespace-pre-wrap break-all"
          :class="isJson ? 'text-foreground' : 'text-secondary'"
        >{{ responseBody || '(empty response)' }}</pre>
      </div>
    </Transition>

  </div>
</template>
