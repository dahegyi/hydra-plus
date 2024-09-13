import { TYPE_SRC, TYPE_COMPLEX, PARAM_MAPPINGS } from "@/constants";

export const deepCopy = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

export const flattenExternal = (obj, index) => {
  return `s${index}.${obj.name}(${
    obj.params && obj.params[0] ? `"${obj.params[0]}"` : ""
  })\n`;
};

/**
 * Returns a block with mapped parameters
 */
export const mapParams = (blocks) => {
  const mappedBlocks = [];

  if (!blocks) {
    return;
  }

  for (const block of blocks) {
    const mapping = PARAM_MAPPINGS[block.name];

    const mappedParams = block.params.map((value, index) => ({
      name: mapping[index],
      value,
    }));

    const mappedChildren = mapParams(block.blocks);

    mappedBlocks.push({
      ...block,
      params: mappedParams,
      blocks: mappedChildren,
    });
  }

  return mappedBlocks;
};

/**
 * Returns hydra code from codeblox
 */
export const flatten = (obj, isPopper) => {
  let source = "";

  if (Array.isArray(obj)) {
    for (let item of obj) {
      source += flatten(item, isPopper);
    }
  } else {
    // Sources are top level functions
    if (obj.type !== TYPE_SRC) {
      source += ".";
    }

    if (isPopper && obj.type === TYPE_SRC) source += "popperHydra.value.";
    source += `${obj.name}(`;
    if (isPopper && obj.name === "src") source += "popperHydra.value.";

    if (obj.type === TYPE_COMPLEX) {
      // Modulation requires a source as a parameter
      if (obj.blocks.length > 0) {
        source += flatten(obj.blocks[0], isPopper);
        source += ",";
      } else {
        // fallback to osc
        if (isPopper) source += "popperHydra.value.";
        source += "osc(10, 0.1, 0),";
      }
    }

    for (const [i, param] of obj.params?.entries() || []) {
      source += param;

      if (i < obj.params.length - 1) {
        source += ",";
      }
    }

    source += ")";

    if (obj.type !== TYPE_COMPLEX && obj.blocks?.length > 0) {
      source += flatten(obj.blocks, isPopper);
    }
  }

  return source;
};
