import Toastify from "toastify-js";

export const showToast = (error) => {
  Toastify({
    text: error,
    duration: 4000,
    close: true,
    gravity: "bottom",
    stopOnFocus: true,
  }).showToast();
};
