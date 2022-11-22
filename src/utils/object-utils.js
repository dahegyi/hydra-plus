import { TYPE_SRC } from "../constants";

export const deepCopy = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Flattens codeblocks to hydra code
 * @param {object} obj
 */
export const flatten = (obj) => {
  let source = "";

  if (Array.isArray(obj)) {
    for (let item of obj) {
      source += flatten(item);
    }
  } else {
    if (obj.type === TYPE_SRC) {
      source += `${obj.name}(`;
    } else {
      source += `.${obj.name}(`;
    }

    for (let param of obj.params) {
      source += param.value;

      if (param !== obj.params[obj.params.length - 1]) {
        source += ",";
      }
    }

    source += ")";

    if (obj.blocks?.length > 0) {
      source += flatten(obj.blocks);
    }
  }

  return source;
};
