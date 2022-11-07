import { createApp } from "vue";
import "./style.scss";
import App from "./App.vue";
import { createRouter, createWebHistory } from "vue-router";

import Home from "./components/Home.vue";
import Visualizer from "./components/Visualizer.vue";
import Code from "./components/Code.vue";

import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faShare, faPlay } from "@fortawesome/free-solid-svg-icons";

const routes = [
  { path: "/", component: Home },
  { path: "/visualizer", component: Visualizer },
  { path: "/code", component: Code },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

library.add(faShare);
library.add(faPlay);

createApp(App)
  .use(router)
  .component("font-awesome-icon", FontAwesomeIcon)
  .mount("#app");
