import { TYPE_SRC, TYPE_COMPLEX } from "@/constants";

export const deepCopy = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

export const flattenExternal = (obj, index) => {
  return `s${index}.${obj.name}(${
    obj.params && obj.params[0] ? `"${obj.params[0].value}"` : ""
  })\n`;
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
    if (obj.type !== TYPE_SRC) {
      source += ".";
    }

    source += `${obj.name}(`;

    // Modulation requires a source as a parameter
    if (obj.type === TYPE_COMPLEX) {
      if (obj.blocks.length > 0) {
        source += flatten(obj.blocks[0]);
        source += ",";
      } else {
        // fallback to osc
        source += "osc(10, 0.1, 0),";
      }
    }

    for (const param of obj.params || []) {
      source += param.value;

      if (param !== obj.params[obj.params.length - 1]) {
        source += ",";
      }
    }

    source += ")";

    if (obj.type !== TYPE_COMPLEX && obj.blocks?.length > 0) {
      source += flatten(obj.blocks);
    }
  }

  return source;
};
