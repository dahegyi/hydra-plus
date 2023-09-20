<template>
  <router-view v-slot="{ Component }">
    <component :is="Component" :key="$route.path" />
  </router-view>
</template>

<script>
import { MAX_NUMBER_OF_SOURCES, MAX_NUMBER_OF_EXTERNALS } from "./constants";

window.hydra = new Hydra({
  numSources: MAX_NUMBER_OF_SOURCES,
  numOutputs: MAX_NUMBER_OF_EXTERNALS,
  width: window.outerWidth * window.devicePixelRatio,
  height: window.outerHeight * window.devicePixelRatio,
}).synth;
</script>

<style>
canvas {
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
}
</style>
