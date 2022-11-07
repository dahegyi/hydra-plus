<script setup>
import { watch } from 'vue';
import { useBroadcastChannel } from '@vueuse/core';

const {
    data,
    error
} = useBroadcastChannel({ name: 'hydra-plus-channel' })

watch(data, () => {
    if (data.value)
        eval(data.value)
})
</script>

<template>
    {{ error }}
</template>

<script>
export default {
    name: 'Visualizer',
}
</script>