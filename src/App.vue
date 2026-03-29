<script setup lang="ts">
import SharedFooter from './components/shared/SharedFooter.vue'
import SharedHeader from './components/shared/SharedHeader.vue'
import AboutModal from './components/AboutModal.vue'

</script>

<template>
  <main class="max-w-3xl m-auto space-y-8 px-6">
    <SharedHeader/>
    <RouterView/>
    <SharedFooter/>
  </main>
  <AboutModal />
</template>
