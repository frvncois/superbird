<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import AddTask from '@/components/modal/AddTask.vue'


const props = defineProps({
  project: Object,
  tasks: Array
})

const iframeRef = ref(null)
const iframeLoaded = ref(false)
const showTaskForm = ref(false)
const modalStyle = ref({})
const pinRect = ref(null)
const selectedPageUrl = ref('')
defineExpose({ iframeRef })


const iframeSrc = computed(() => {
  if (!props.project?.url || !props.project?.id) return null
  return `https://supershell.hello-ed6.workers.dev/?url=${encodeURIComponent(props.project.url)}&project=${props.project.id}`
})

const injectPins = () => {
  const iframe = iframeRef.value
  if (!iframe?.contentWindow) return

  props.tasks.forEach(task => {
    if (!task.selector || !task.page_url) return
    iframe.contentWindow.postMessage({
      type: 'guano/target-acquired',
      rect: JSON.parse(task.selector),
      selector: task.selector,
      page_url: task.page_url,
      from_db: true
    }, '*')
  })

  console.log('[Superbird] ✅ Injected all pins')
}

function onIframeLoad() {
  iframeLoaded.value = true

  console.log('[Superbird] ✅ Iframe loaded, assuming Guano.js is injected by proxy.')

}


watch(iframeLoaded, (loaded) => {
  if (loaded) injectPins()
})

onMounted(() => {
  window.addEventListener('message', (event) => {
    const data = event.data
    if (data?.type === 'guano/target-acquired' && !data.from_db && data.rect) {
      const iframeRect = iframeRef.value.getBoundingClientRect()

      modalStyle.value = {
        position: 'absolute',
        top: `${iframeRect.top + data.mouseInViewport.y}px`,
        left: `${iframeRect.left + data.mouseInViewport.x}px`,
        zIndex: 1000
      }

      pinRect.value = data.rect
      selectedPageUrl.value = data.page_url // ✅ fix was here

      console.log('[Superbird] 💾 Pin rect:', data.rect)
      console.log('[Superbird] 📄 Page URL:', data.page_url)

      showTaskForm.value = true
    }
  })
})
</script>

<template>
  <section>
    <iframe
  v-if="iframeSrc"
  :src="iframeSrc"
  ref="iframeRef"
  width="100%"
  height="100%"
  style="border: none"
  @load="onIframeLoad"
/>

    <AddTask
      v-if="showTaskForm"
      :style="modalStyle"
      :pinRect="pinRect"
      :pageUrl="selectedPageUrl"
      @close="showTaskForm = false"
    />
  </section>
</template>

  
  <style scoped>
  section {
    position: relative;
    height: 100vh;
  }
  
  .pin {
    position: absolute;
    background-color: red;
    border-radius: 50%;
    z-index: 999;
    pointer-events: none;
    border: 2px solid white;
  }
  </style>
  