import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { useToast } from "@/components/ui/toast/use-toast";
const { toast } = useToast();

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const safeKeys = [
  "blocks",
  "externalSourceBlocks",
  "synthSettings",
  "welcomeModalLastUpdate",
];

export const getSafeLocalStorage = (key) => {
  if (safeKeys.includes(key)) {
    if (localStorage.getItem(key)) {
      try {
        return JSON.parse(localStorage.getItem(key));
      } catch {
        return localStorage.getItem(key);
      }
    }
    return;
  } else {
    return console.error(`Key not found in localStorage safe keys: ${key}`);
  }
};

export const setSafeLocalStorage = (key, value) => {
  if (safeKeys.includes(key)) {
    if (typeof value === "object") {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.setItem(key, value);
    }
  }
};

export const showErrorToast = (error) => {
  console.error(error);
  toast({
    title: "Error",
    description: error,
  });
};

export const setHueLights = async (state) => {
  const bridgeIp = "192.168.2.1";
  const username = "5Vk5HtnmgO-LLw2ai36FprAn2shzwBItE3ubZIlT";
  const lightLength = 6;

  const xy = (red, green, blue) => {
    red =
      red > 0.04045
        ? Math.pow((red + 0.055) / (1.0 + 0.055), 2.4)
        : red / 12.92;

    green =
      green > 0.04045
        ? Math.pow((green + 0.055) / (1.0 + 0.055), 2.4)
        : green / 12.92;

    blue =
      blue > 0.04045
        ? Math.pow((blue + 0.055) / (1.0 + 0.055), 2.4)
        : blue / 12.92;

    const X = red * 0.664511 + green * 0.154324 + blue * 0.162028;
    const Y = red * 0.283881 + green * 0.668433 + blue * 0.047685;
    const Z = red * 0.000088 + green * 0.07231 + blue * 0.986039;

    const fx = X / (X + Y + Z);
    const fy = Y / (X + Y + Z);

    return [parseFloat(fx.toPrecision(4)), parseFloat(fy.toPrecision(4))];
  };

  for (let i = 1; i <= lightLength; i++) {
    const url = `http://${bridgeIp}/api/${username}/lights/${i}/state`;

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          on: true,
          bri: 255,
          xy: xy(state.r, state.g, state.b),
        }),
      });
      const data = await response.json();
      console.log(data);
    } catch (error) {
      showErrorToast(error);
    }
  }
};
