<template>
  <router-view v-slot="{ Component }">
    <component :is="Component" :key="$route.path" />
  </router-view>
</template>

<script>
new Hydra({ makeGlobal: true, detectAudio: true, width: window.innerWidth, height: window.innerHeight }).synth
</script>

<style>
canvas {
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
}
</style>
