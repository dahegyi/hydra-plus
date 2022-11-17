<script setup>
import { watch } from 'vue';
import { useBroadcastChannel } from '@vueuse/core';

const {
    data
} = useBroadcastChannel({ name: 'hydra-plus-channel' })

watch(data, () => {
    if (data.value)
        eval(data.value)
})
</script>

<template>
</template>

<script>
export default {}
</script>