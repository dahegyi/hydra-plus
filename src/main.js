import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";

import store from "./store";

import "./assets/styles/main.scss";
import App from "./App";

const GuiPage = () => import("./pages/GuiPage");
const VisualizerPage = () => import("./pages/VisualizerPage");

const routes = [
  { path: "/", component: GuiPage },
  { path: "/visualizer", component: VisualizerPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

createApp(App).use(router).use(store).mount("#app");
