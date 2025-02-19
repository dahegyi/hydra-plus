import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

import autoprefixer from "autoprefixer";
import tailwind from "tailwindcss";

export default defineConfig(({ mode }) => {
  const config = {
    define: {
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
    },
    css: {
      postcss: {
        plugins: [tailwind(), autoprefixer()],
      },
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
