import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";

import store from "./store";

import "./style.scss";
import App from "./App.vue";

const Visualizer = () => import("./pages/Visualizer.vue");
const Gui = () => import("./pages/Gui.vue");

const routes = [
  { path: "/", component: Gui },
  { path: "/visualizer", component: Visualizer },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

createApp(App).use(router).use(store).mount("#app");
