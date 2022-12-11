<template>
  <router-view v-slot="{ Component }">
    <component :is="Component" :key="$route.path" />
  </router-view>
</template>

<script>
import { BACKGROUND_CODES } from './constants';

new Hydra({ makeGlobal: true, detectAudio: true, width: window.innerWidth, height: window.innerHeight }).synth

const randomBackground = () => {
  const index = Math.floor(Math.random() * BACKGROUND_CODES.length);
  return BACKGROUND_CODES[index];
};

eval(randomBackground());
</script>

<style>
canvas {
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
}
</style>
