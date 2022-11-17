<template>
    <div class="home-container">
        display this tab on a projector to start hacking

        <a class="btn" @click="start">start</a>
    </div>
</template>

<script>
export default {
    methods: {
        start() {
            this.$router.push({ path: "/visualizer" })
            window.open(`/code`, '_blank');
        }
    }
}
</script>
