import { TYPE_SRC } from "../constants";

export const deepCopy = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Returns hydra code from codeblox
 */
export const flatten = (obj) => {
  let source = "";

  if (Array.isArray(obj)) {
    for (let item of obj) {
      source += flatten(item);
    }
  } else {
    // Sources are top level functions
    if (!obj.type === TYPE_SRC) {
      source += ".";
    }

    source += `${obj.name}(`;

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
