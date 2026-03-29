import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { RequestStatus } from '@/types'

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface Header { key: string; value: string; enabled: boolean }

// RFC 7230 token — valid HTTP header name characters
const VALID_HEADER_NAME = /^[a-zA-Z0-9!#$%&'*+\-.^_`|~]+$/

function isValidHttpUrl(value: string): boolean {
  try {
    const u = new URL(value.trim())
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

export const useApiStore = defineStore('api', () => {
  const url = ref('https://')
  const method = ref<Method>('GET')
  const headers = ref<Header[]>([{ key: '', value: '', enabled: true }])
  const body = ref('')
  const status = ref<RequestStatus>('idle')
  const responseStatus = ref<number | null>(null)
  const responseTime = ref<number | null>(null)
  const responseBody = ref<string>('')
  const errorMessage = ref('')

  let abortController: AbortController | null = null

  const hasBody = computed(() => method.value !== 'GET' && method.value !== 'DELETE')

  function addHeader() {
    headers.value.push({ key: '', value: '', enabled: true })
  }

  function removeHeader(index: number) {
    if (headers.value.length > 1) headers.value.splice(index, 1)
  }

  async function send() {
    const trimmedUrl = url.value.trim()
    if (!trimmedUrl) return
    if (!isValidHttpUrl(trimmedUrl)) {
      status.value = 'error'
      errorMessage.value = 'URL must start with http:// or https://'
      return
    }

    abortController?.abort()
    abortController = new AbortController()

    status.value = 'loading'
    responseStatus.value = null
    responseTime.value = null
    responseBody.value = ''
    errorMessage.value = ''

    const headersObj: Record<string, string> = {}
    for (const h of headers.value) {
      const key = h.key.trim()
      if (h.enabled && key && VALID_HEADER_NAME.test(key)) {
        headersObj[key] = h.value
      }
    }

    const t0 = performance.now()
    try {
      const res = await fetch(trimmedUrl, {
        method: method.value,
        headers: headersObj,
        body: hasBody.value && body.value.trim() ? body.value : undefined,
        signal: abortController.signal,
      })
      responseTime.value = Math.round(performance.now() - t0)
      responseStatus.value = res.status

      const text = await res.text()
      try {
        responseBody.value = JSON.stringify(JSON.parse(text), null, 2)
      } catch {
        responseBody.value = text
      }
      status.value = 'done'
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      responseTime.value = Math.round(performance.now() - t0)
      status.value = 'error'
      errorMessage.value = (err as Error).message
    }
  }

  return {
    url, method, headers, body, status,
    responseStatus, responseTime, responseBody, errorMessage,
    hasBody, addHeader, removeHeader, send,
  }
})
