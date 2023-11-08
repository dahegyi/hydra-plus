<template>
  <router-view v-slot="{ Component }">
    <component :is="Component" :key="$route.path" />
  </router-view>
  <canvas id="hydra-canvas" :height="height" :width="width" />
</template>

<script>
import Hydra from "hydra-synth";

import { MAX_NUMBER_OF_SOURCES, MAX_NUMBER_OF_EXTERNALS } from "./constants";

// import * as three from "three";
// import { OBJLoader } from "three/addons/loaders/OBJLoader.js";

export default {
  data() {
    return {
      height: (window.innerHeight * window.devicePixelRatio) / 16,
      width: (window.innerWidth * window.devicePixelRatio) / 16,
    };
  },

  mounted() {
    window.hydra = new Hydra({
      numSources: MAX_NUMBER_OF_SOURCES,
      numOutputs: MAX_NUMBER_OF_EXTERNALS,
      height: this.height,
      width: this.width,
      canvas: document.getElementById("hydra-canvas"),
    }).synth;

    // const t = new three();
    // t.scene;
    // t.camera;
    // t.renderer;

    // // you need to set the s0 free by adding an emtpy external source
    // s0.initTHREE(t);

    // const objLoader = new OBJLoader();
    // objLoader.load("/src/pizza.obj", (object) => {
    //   t.scene.add(object);
    // });

    // function animate() {
    //   requestAnimationFrame(animate);

    //   // t.scene.position.y = -0.5;
    //   t.scene.position.z = -2;
    //   // t.scene.rotation.z += 0.01;
    //   t.scene.rotation.y -= 0.01;

    //   t.renderer.render(t.scene, t.camera);
    // }

    // animate();

    // src(s0)
    //   .blend(src(o0).scale(1.1).modulate(src(s0)))
    //   .blend(
    //     src(o0)
    //       .scale(1.01)
    //       .colorama([0.1, 0.05].fast(1 / 8).smooth()),
    //   )
    //   .diff(src(s0).scale(0.9).rotate(180))
    //   .contrast(23)
    //   .out();
  },
};

// window.onbeforeunload = function () {
//   document.getElementsByClass("threejs").remove();
// };
</script>

<style>
canvas {
  position: fixed;
  z-index: -1;
  width: 100%;
  height: 100%;
}
</style>
