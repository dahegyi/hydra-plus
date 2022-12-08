import { createApp } from "vue";
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

const BASE_URL = import.meta.env.BASE_URL;

const routes = [
  { path: `${BASE_URL}/`, component: Home },
  { path: `${BASE_URL}/visualizer`, component: Visualizer },
  { path: `${BASE_URL}/code`, component: Code },
  { path: `${BASE_URL}/gui`, component: Gui },
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
