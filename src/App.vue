<template>
  <router-view v-slot="{ Component }">
    <component :is="Component" :key="$route.path" />
  </router-view>
</template>

<script>
new Hydra({ makeGlobal: true, detectAudio: true, width: window.innerWidth, height: window.innerHeight }).synth
</script>
