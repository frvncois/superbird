<script setup>
import AppButton from '@/components/button/AppButton.vue'

const props = defineProps({
  plan: {
    type: Object,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <li class="card plan">
    <div class="header">
      <h3>{{ plan.name }}</h3>
      <p class="price">${{ plan.price }}/month</p>
    </div>

    <ul class="limits">
      <li>{{ plan.projects }} {{ plan.projects === 'Unlimited' ? '' : 'projects' }}</li>
      <li>{{ plan.collaborators }} {{ plan.collaborators === 'Unlimited' ? '' : 'collaborators' }}</li>
      <li>{{ plan.storage }} storage</li>
    </ul>

    <div class="actions">
      <AppButton
        :text="isActive ? 'Current Plan' : 'Select Plan'"
        :type="isActive ? 'disabled' : 'add'"
        :action="() => {}"
        :disabled="isActive"
      />
    </div>
  </li>
</template>

<style scoped>
.card.plan {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: #111;
  border: 1px solid #333;
  border-radius: 0.75rem;
}
.header h3 {
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
}
.price {
  font-size: 1rem;
  color: #999;
}
.limits {
  list-style: none;
  padding: 0;
  margin: 0;
  color: #ccc;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
</style>
