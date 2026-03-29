<script setup lang="ts">
import { computed } from 'vue'
import { useRouteLeave } from '@/composables/useRouteLeave'
import { useAboutModal } from '@/composables/useAboutModal'

const leaving = useRouteLeave()
const footerStyle = computed(() => ({
  animation: leaving.value ? 'superbird-fade-out 0.25s ease both' : 'superbird-fade-in 0.4s ease both',
}))

const { open } = useAboutModal()
</script>

<template>
  <footer :style="footerStyle">
    <div class="flex justify-between border-t py-6 text-[10px] text-secondary/50 font-mono uppercase">
      <div>© 2026 Superbird · by <a href="https://frvncois.com" target="_blank" rel="noopener noreferrer" class="cursor-pointer hover:text-secondary" style="transition: color 0.25s ease">Francois Lemieux</a></div>
      <div class="space-x-3">
        <RouterLink to="/terms" class="cursor-pointer hover:text-secondary" style="transition: color 0.25s ease">Terms & Privacy</RouterLink>
        <span>·</span>
        <button class="cursor-pointer hover:text-secondary uppercase" style="transition: color 0.25s ease" @click="open">About</button>
      </div>
    </div>
  </footer>
</template>
