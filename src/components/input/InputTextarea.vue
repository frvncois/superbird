<template>
    <li class="input">
        <label>{{ label }}</label>
        <div data-type="text">
            <textarea :placeholder="placeholder"/>
            <p>{{ note }}</p>
        </div>
    </li>
</template>

<script setup>
defineProps({
    label: {
        type: String,
        required: true
    },
    placeholder: {
        type: String,
        required: true
    },
    note: {
        type: String,
        default: ''
    }
});
</script>
