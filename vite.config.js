import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ mode }) => {
  const config = {
    define: {
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
    },
    plugins: [vue()],
    resolve: {
      alias: {
        "@": "/src",
      },
      extensions: [".js", ".vue"],
    },
  };

  if (mode === "development") {
    config.define.global = {};
  }

  return config;
});
