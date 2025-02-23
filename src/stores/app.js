import { defineStore } from "pinia";
import { ref } from "vue";
import { getSafeLocalStorage, setSafeLocalStorage } from "@/utils";

export const useAppStore = defineStore("app", () => {
  const areAnimationsEnabled = ref(
    getSafeLocalStorage("animationsEnabled") ?? true,
  );

  const toggleAnimations = () => {
    areAnimationsEnabled.value = !areAnimationsEnabled.value;

    document.documentElement.dataset.animations = areAnimationsEnabled.value
      ? "on"
      : "off";

    setSafeLocalStorage("animationsEnabled", areAnimationsEnabled.value);
  };

  return { areAnimationsEnabled, toggleAnimations };
});
