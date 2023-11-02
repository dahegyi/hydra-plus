import { useBroadcastChannel } from "@vueuse/core";
const { post } = useBroadcastChannel({ name: "hydra-plus-channel" });

import { deepCopy, flatten, flattenExternal } from "~/utils/object-utils";

import store from "./";

import { showToast } from "~/utils/index.js";

import {
  MAX_NUMBER_OF_SOURCES,
  MAX_NUMBER_OF_EXTERNALS,
  TYPE_SRC,
  TYPE_EXTERNAL,
  TYPE_THREE,
  TYPE_COMPLEX,
} from "~/constants";

export const setFocus = ({ commit }, focused) => {
  commit("setFocus", focused);
};

export const setInputFocus = ({ commit }, isInputFocused) => {
  commit("setInputFocus", isInputFocused);
};

export const setBlocks = ({ commit, state }, { blocks, shouldSetHistory }) => {
  if (
    blocks.filter((block) => block.type === TYPE_SRC) === state.blocks &&
    blocks.filter((block) => block.type === TYPE_EXTERNAL) ===
      state.externalSourceBlocks
  ) {
    return;
  }

  commit("setBlocks", blocks);

  store.dispatch("update", shouldSetHistory);
};

/**
 * Adds source to the main code block or to a child block.
 * Deep copy is needed because we want to handle the input parameters
 * differently for different sources.
 *
 * @param {Object} source source object
 */
export const addParent = ({ commit, state }, source) => {
  const copiedSource = deepCopy(source);

  if (!state.focused) {
    if (
      source.type === TYPE_SRC &&
      state.blocks.length >= MAX_NUMBER_OF_SOURCES
    ) {
      return showToast(
        `You can't add more than ${MAX_NUMBER_OF_SOURCES} sources.`,
      );
    }

    if (
      (source.type === TYPE_EXTERNAL || source.type === TYPE_THREE) &&
      state.externalSourceBlocks.length >= MAX_NUMBER_OF_EXTERNALS
    ) {
      return showToast(
        `You can't add more than ${MAX_NUMBER_OF_EXTERNALS} externals.`,
      );
    }

    commit("addParent", copiedSource);
    commit("setFocus", state.blocks[state.blocks.length - 1]);
    commit("setOutput", state.blocks.length - 1);
  } else {
    commit("addChild", copiedSource);
  }

  if (source.type === TYPE_EXTERNAL) {
    const addedExternal = flattenExternal(
      copiedSource,
      state.externalSourceBlocks.length - 1,
    );

    eval(addedExternal);
    post(addedExternal);
  } else {
    store.dispatch("setBlocks", {
      blocks: [...state.blocks, ...state.externalSourceBlocks],
    });
  }
};

/**
 * Adds effect block to the focused block as a child.
 */
export const addChild = ({ commit, state }, effect) => {
  if (!state.focused) {
    return;
  }

  commit("addChild", deepCopy(effect));

  if (effect.type === TYPE_COMPLEX) {
    commit("setFocus", state.focused.blocks[state.focused.blocks.length - 1]);
  }

  store.dispatch("setBlocks", {
    blocks: [...state.blocks, ...state.externalSourceBlocks],
  });
};

export const deleteParent = ({ commit, state }, payload) => {
  const { blocks, externalSourceBlocks, synthSettings } = state;

  commit("deleteParent", payload);

  if (!blocks[synthSettings.output] && blocks.length > 0)
    commit("setOutput", blocks.length - 1);

  store.dispatch("setBlocks", {
    blocks: [...blocks, ...externalSourceBlocks],
  });
};

export const deleteChild = ({ commit, state }, payload) => {
  const { element, children, parent } = payload;

  for (const child of children) {
    if (child === element) {
      if (state.focused !== parent) commit("setFocus", parent);

      // @todo probably not the best way to do this
      children.splice(children.indexOf(child), 1);

      return store.dispatch("setBlocks", {
        blocks: [...state.blocks, ...state.externalSourceBlocks],
      });
    }
  }
};

export const setBlockPosition = ({ commit }, payload) => {
  commit("setBlockPosition", payload);
  store.dispatch("setHistory");
};

export const update = ({ commit, state }, shouldSetHistory = true) => {
  const { blocks, externalSourceBlocks, synthSettings } = state;

  let codeString = "";

  if (blocks.length === 0) {
    codeString = "hush()";
  } else {
    if (!synthSettings.output || !blocks[synthSettings.output])
      commit("setOutput", 0);

    for (let i = 0; i < externalSourceBlocks.length; i++) {
      if (externalSourceBlocks[i].name !== "initScreen") {
        codeString += flattenExternal(externalSourceBlocks[i], i);
      }
    }

    for (let i = 0; i < blocks.length; i++) {
      codeString += `${flatten(blocks[i])}.out(o${i})\n`;
    }

    codeString += `window.hydra.render(o${synthSettings.output})`;
  }

  try {
    eval(codeString);
    commit("setCodeString", codeString);
  } catch (error) {
    console.error(error);

    showToast(error);
  }

  if (shouldSetHistory) store.dispatch("setHistory");
};

export const send = ({ state }) => {
  if (state.codeString) {
    post(state.codeString);

    localStorage.setItem(
      "externalSourceBlocks",
      JSON.stringify(state.externalSourceBlocks),
    );
    localStorage.setItem("blocks", JSON.stringify(state.blocks));

    store.dispatch("setSynthSettings", state.synthSettings);
  }
};

export const setSynthSettings = ({ commit, state }, synthSettings) => {
  eval(`bpm = ${synthSettings.bpm}`);
  post(`bpm = ${synthSettings.bpm}`);

  eval(`speed = ${synthSettings.speed}`);
  post(`speed = ${synthSettings.speed}`);

  const multiplier = (synthSettings.resolution * window.devicePixelRatio) / 100;

  eval(
    `setResolution(${window.outerHeight * multiplier}, ${
      window.outerWidth * multiplier
    })`,
  );
  post(
    `setResolution(${window.outerHeight * multiplier}, ${
      window.outerWidth * multiplier
    })`,
  );

  eval(`fps = ${synthSettings.fps}`);
  post(`fps = ${synthSettings.fps}`);

  localStorage.setItem("synthSettings", JSON.stringify(synthSettings));

  if (synthSettings === state.synthSettings) return;

  commit("setSynthSettings", synthSettings);
};

export const setOutput = ({ state, commit }, output) => {
  if (state.synthSettings.output === output) return;

  commit("setOutput", output);

  store.dispatch("update", false);
};

// History

export const setHistory = ({ commit }) => {
  commit("setHistory");
  commit("setHistoryIndex", 0);
};

/**
 * @param {Number} direction 1 for undo, -1 for redo
 */
export const undoRedo = ({ commit, state }, direction) => {
  const { history, historyIndex } = state;
  const newHistoryIndex = historyIndex + direction;

  if (newHistoryIndex < 0 || newHistoryIndex >= history.length) return;

  commit("setHistoryIndex", newHistoryIndex);

  store.dispatch("setBlocks", {
    blocks: deepCopy([
      ...history[newHistoryIndex].blocks,
      ...history[newHistoryIndex].externalSourceBlocks,
    ]),
    shouldSetHistory: false,
  });
};
