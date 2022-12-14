import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";

import "./style.css";
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

createApp(App).use(router).mount("#app");
