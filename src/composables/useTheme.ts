import { ref, watchEffect } from 'vue'

const stored = localStorage.getItem('theme')
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
const dark = ref(stored ? stored === 'dark' : prefersDark)

watchEffect(() => {
  document.documentElement.classList.toggle('dark', dark.value)
  localStorage.setItem('theme', dark.value ? 'dark' : 'light')
})

export function useTheme() {
  return {
    dark,
    toggle: () => { dark.value = !dark.value },
  }
}
