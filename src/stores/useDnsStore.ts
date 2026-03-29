import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { queryAllRecords, RECORD_TYPES, type DnsTypeResult } from '../utils/dns'
import type { RequestStatus } from '@/types'

type LoadingStatus = 'pending' | 'loading' | 'done' | 'error'

interface LoadingType {
  type: string
  status: LoadingStatus
}

export const useDnsStore = defineStore('dns', () => {
  const domain = ref('https://')
  const status = ref<RequestStatus>('idle')
  const results = ref<Record<string, DnsTypeResult> | null>(null)
  const loadingTypes = ref<LoadingType[]>([])
  const errorMessage = ref('')

  let abortController: AbortController | null = null

  const cleanDomain = computed(() =>
    domain.value.replace(/^https?:\/\//, '').replace(/^www\./, '').trim()
  )

  const isValidDomain = computed(() => {
    const v = cleanDomain.value
    return v.length > 0 && v.includes('.') && !v.includes(' ')
  })

  const hasResults = computed(() => status.value === 'done' && results.value !== null)

  async function check() {
    if (status.value === 'loading') return
    domain.value = cleanDomain.value
    if (!isValidDomain.value) return

    abortController?.abort()
    abortController = new AbortController()

    status.value = 'loading'
    results.value = null
    errorMessage.value = ''
    loadingTypes.value = RECORD_TYPES.map(type => ({ type, status: 'pending' as LoadingStatus }))

    function onProgress(type: string, s: string) {
      const idx = loadingTypes.value.findIndex(t => t.type === type)
      if (idx !== -1) loadingTypes.value[idx] = { type, status: s as LoadingStatus }
    }

    try {
      const data = await queryAllRecords(domain.value, onProgress, abortController.signal)
      results.value = data
      status.value = 'done'
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      status.value = 'error'
      errorMessage.value = (err as Error).message
    }
  }

  function reset() {
    abortController?.abort()
    status.value = 'idle'
    results.value = null
    errorMessage.value = ''
  }

  return {
    domain, status, results, loadingTypes, errorMessage,
    isValidDomain, cleanDomain, hasResults,
    check, reset,
  }
})
