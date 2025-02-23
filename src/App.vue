<script setup>
import { ref, onMounted } from "vue";
import { getSafeLocalStorage } from "@/utils";

import Hydra from "hydra-synth";

import { MAX_NUMBER_OF_SOURCES, MAX_NUMBER_OF_EXTERNALS } from "./constants";

// import { OBJLoader } from "three/addons/loaders/OBJLoader.js";

const height = ref(window.innerHeight * window.devicePixelRatio);
const width = ref(window.innerWidth * window.devicePixelRatio);

onMounted(() => {
  window.hydra = new Hydra({
    numSources: MAX_NUMBER_OF_EXTERNALS,
    numOutputs: MAX_NUMBER_OF_SOURCES,
    height: height.value,
    width: width.value,
    canvas: document.getElementById("hydra-canvas"),
  }).synth;

  const areAnimationsEnabled = getSafeLocalStorage("animationsEnabled");

  document.documentElement.dataset.animations =
    areAnimationsEnabled === "false" ? "off" : "on";

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

  // // Create a mesh for the cube with the geometry and material
  // const cube = new THREE.Mesh(geometry, material);

  // // Create the edges of the cube using LineSegments
  // const edges = new THREE.EdgesGeometry(geometry);
  // const lineMaterial = new THREE.LineBasicMaterial({
  //   color: 0xffffff,
  //   linewidth: 1,
  //   resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
  // });
  // const line = new THREE.LineSegments(edges, lineMaterial);

  // // Add the transparent cube and its edges to the scene
  // t.scene.add(cube);
  // t.scene.add(line);

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
});

// window.onbeforeunload = function () {
//   document.getElementsByClass("threejs").remove();
// };
</script>

<template>
  <router-view v-slot="{ Component }">
    <component :is="Component" :key="$route.path" />
  </router-view>
  <canvas id="hydra-canvas" :height="height" :width="width" />
</template>

<style scoped>
canvas {
  position: fixed;
  z-index: -1;
  width: 100%;
  height: 100%;
}
</style>
