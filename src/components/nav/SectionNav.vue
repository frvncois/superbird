<script setup>
import InputSearch from '@/components/input/InputSearch.vue';
import AppButton from '@/components/button/AppButton.vue'

defineProps({
button: {
type: Object,
default: null
}
})
</script>

<template>
    <li class="filters">
        <InputSearch />
        <AppButton
        v-if="button"
        :text="button.text"
        :type="button.type"
        :action="button.action"
        />
    </li>
</template>