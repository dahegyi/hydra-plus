<template>
  <router-view v-slot="{ Component }">
    <component :is="Component" :key="$route.path" />
  </router-view>
</template>

<script>
import Hydra from "hydra-synth";

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
  z-index: -1;
  top: 0;
  left: 0;
}
</style>
