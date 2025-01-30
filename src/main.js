import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import "./assets/styles/main.scss";
import App from "./App";
import { isButtonPressed, activeButtons } from "./utils/gamecontroller-utils";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

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

window.isButtonPressed = isButtonPressed;

/* eslint-disable-next-line no-undef */
gameControl.on("connect", function (gamepad) {
  const buttons = [
    { id: "button1", name: "1" },
    { id: "button2", name: "2" },
    { id: "button3", name: "3" },
    { id: "button4", name: "4" },
    { id: "button5", name: "5" },
    { id: "button6", name: "6" },
    { id: "button7", name: "7" },
    { id: "button8", name: "8" },
    { id: "button9", name: "9" },
    { id: "button10", name: "10" },
    { id: "button11", name: "11" },
    { id: "button12", name: "12" },
    { id: "button13", name: "13" },
    { id: "button14", name: "14" },
    { id: "button15", name: "15" },
    { id: "left0", name: "left0" },
    { id: "right0", name: "right0" },
    { id: "up0", name: "up0" },
    { id: "down0", name: "down0" },
    { id: "left1", name: "left1" },
    { id: "right1", name: "right1" },
    { id: "up1", name: "up1" },
    { id: "down1", name: "down1" },
  ];

  buttons.forEach(({ id, name }) => {
    gamepad
      .before(id, () => {
        activeButtons[name] = true;
        console.log(`${name} pressed`);
      })
      .after(id, () => {
        activeButtons[name] = false;
      });
  });
});

createApp(App).use(router).use(pinia).mount("#app");
