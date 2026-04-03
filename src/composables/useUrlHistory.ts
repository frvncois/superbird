import { ref } from 'vue'

const MAX = 10

export function useUrlHistory(key: string | undefined) {
  const storageKey = key ? `superbird:history:${key}` : null

  function load(): string[] {
    if (!storageKey) return []
    try {
      return JSON.parse(localStorage.getItem(storageKey) ?? '[]')
    } catch {
      return []
    }
  }

  const urls = ref<string[]>(load())

  function push(url: string) {
    if (!storageKey) return
    const trimmed = url.trim()
    if (!trimmed) return
    urls.value = [trimmed, ...urls.value.filter(u => u !== trimmed)].slice(0, MAX)
    localStorage.setItem(storageKey, JSON.stringify(urls.value))
  }

  function remove(url: string) {
    if (!storageKey) return
    urls.value = urls.value.filter(u => u !== url)
    localStorage.setItem(storageKey, JSON.stringify(urls.value))
  }

  return { urls, push, remove }
}
