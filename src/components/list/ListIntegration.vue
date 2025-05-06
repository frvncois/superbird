<script setup>
const props = defineProps({ integration: Object })

function goToIntegration() {
  console.log('Open integration:', props.integration.id)
  // Optional: route to integration settings or auth flow
}
</script>

<template>
  <li class="card">
    <img :alt="integration.title + ' icon'" />
    <div class="header">
      <ul>
        <li><h3>{{ integration.title }}</h3></li>
        <p>{{ integration.details }}</p>
      </ul>
      <ul>
        <li><span class="tag active">Active</span></li>
      </ul>
    </div>
    <div class="actions">
      <button class="green" @click="goToIntegration">Connect</button>
    </div>
  </li>
</template>
