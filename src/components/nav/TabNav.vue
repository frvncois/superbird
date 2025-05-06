<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  tabs: {
    type: Array,
    required: true
  }
})

const activeTab = ref(0)

function selectTab(index) {
  activeTab.value = index
}
</script>

<template>
  <li class="tabs">
    <ul>
      <li
        v-for="(tab, index) in tabs"
        :key="index"
        @click="selectTab(index)"
        :class="{ active: activeTab === index }"
      >
        {{ tab }}
      </li>
    </ul>
  </li>
  <template v-for="(tab, index) in tabs" :key="index">
  <slot v-if="activeTab === index" :name="tab.toLowerCase()" />
</template>
</template>
