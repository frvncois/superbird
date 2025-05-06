<template>
    <li class="title">
        <div>
            <h3>{{ title }}</h3>
        </div>
        <button>Publish</button>
    </li>
</template>

<script setup>
defineProps({
    title: {
        type: String,
        required: true
    }
});
</script>
