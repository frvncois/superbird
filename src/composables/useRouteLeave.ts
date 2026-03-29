import { ref, onMounted } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

// Shared singleton — only the first guard to fire blocks navigation;
// the rest are no-ops. State resets when any new component mounts.
const leaving = ref(false)
let guardFired = false

const DURATION = 400

export function useRouteLeave() {
  onMounted(() => {
    leaving.value = false
    guardFired = false
  })

  onBeforeRouteLeave(async () => {
    if (guardFired) return
    guardFired = true
    leaving.value = true
    await new Promise<void>(r => setTimeout(r, DURATION))
  })

  return leaving
}
