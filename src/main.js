import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";

import store from "./store";

import "./style.scss";
import App from "./App.vue";

const GuiPage = () => import("./pages/GuiPage.vue");
const VisualizerPage = () => import("./pages/VisualizerPage.vue");

const routes = [
  { path: "/", component: GuiPage },
  { path: "/visualizer", component: VisualizerPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

createApp(App).use(router).use(store).mount("#app");
