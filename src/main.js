import * as Vue from "vue";
import { createRouter, createWebHistory } from "vue-router";

import "./style.scss";
import App from "./App.vue";

import Home from "./components/Home.vue";
import Visualizer from "./components/Visualizer.vue";
import Code from "./components/Code.vue";
import Gui from "./components/Gui.vue";

import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faShare, faPlay } from "@fortawesome/free-solid-svg-icons";

const routes = [
  { path: "/", component: Home },
  { path: "/visualizer", component: Visualizer },
  { path: "/code", component: Code },
  { path: "/gui", component: Gui },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

library.add(faShare);
library.add(faPlay);

Vue.createApp(App)
  .use(router)
  .component("font-awesome-icon", FontAwesomeIcon)
  .mount("#app");
