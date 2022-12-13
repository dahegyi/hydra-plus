import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";

import "./style.css";
import App from "./App.vue";

const Home = () => import("./pages/Home.vue");
const Visualizer = () => import("./pages/Visualizer.vue");
const Code = () => import("./pages/Code.vue");
const Gui = () => import("./pages/Gui.vue");

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

createApp(App)
  .use(router)
  .component("font-awesome-icon", FontAwesomeIcon)
  .mount("#app");
