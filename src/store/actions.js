import { useBroadcastChannel } from "@vueuse/core";
const { post } = useBroadcastChannel({ name: "hydra-plus-channel" });

import Toastify from "toastify-js";

import store from "./";

import { deepCopy, flatten, flattenExternal } from "@/utils/object-utils";

import {
  MAX_NUMBER_OF_SOURCES,
  MAX_NUMBER_OF_EXTERNALS,
  TYPE_SRC,
  TYPE_EXTERNAL,
  TYPE_THREE,
  TYPE_COMPLEX,
} from "@/constants";

export const setFocus = ({ commit, state }, payload) => {
  // don't call mutation if focus is the same
  if (state.focused === payload) return;

  commit("setFocus", payload);
};

export const addBlock = ({ commit }, payload) => {
  commit("addBlock", payload);
};

export const setBlocks = ({ commit }, payload) => {
  commit("setBlocks", payload);
};

/**
 * Adds source to the main code block or to a child block.
 * Deep copy is needed because we want to handle the input parameters
 * differently for different sources.
 *
 * @param {Object} source - source object
 */
export const addSource = ({ commit, state }, source) => {
  // commit("addSource", payload);
  const copiedObject = deepCopy(source);

  if (!state.focused) {
    if (
      (source.type === TYPE_SRC &&
        state.blocks.filter((block) => block.type === TYPE_SRC).length >=
          MAX_NUMBER_OF_SOURCES) ||
      ((source.type === TYPE_EXTERNAL || source.type === TYPE_THREE) &&
        state.blocks.filter(
          (block) => block.type === TYPE_EXTERNAL || TYPE_THREE,
        ).length >= MAX_NUMBER_OF_EXTERNALS)
    ) {
      return;
    }

    commit("addBlock", copiedObject);
    commit("setOutput", state.blocks.length - 1);

    commit("setFocus", state.blocks[state.blocks.length - 1]);
  } else {
    // this isn't right
    state.focused.blocks.push(copiedObject);
  }

  if (source.type === TYPE_EXTERNAL) {
    const addedExternal = flattenExternal(
      deepCopy(source),
      state.externalSourceBlocks.length - 1,
    );

    eval(addedExternal);
    post(addedExternal);
  } else {
    store.dispatch("update");
  }
};

/**
 * Adds effect block to the focused block as a child.
 */
export const addEffect = ({ commit, state }, effect) => {
  if (!state.focused) {
    return;
  }

  state.focused.blocks.push(deepCopy(effect));

  if (effect.type === TYPE_COMPLEX) {
    commit("setFocus", state.focused.blocks[state.focused.blocks.length - 1]);
  }

  commit("setBlocks", {
    blocks: [...state.blocks, ...state.externalSourceBlocks],
  });

  store.dispatch("update");
};

export const setBlockPosition = ({ commit }, payload) => {
  commit("setBlockPosition", payload);
};

export const deleteBlock = ({ commit, state }, payload) => {
  commit("deleteBlock", payload);

  const { blocks, synthSettings } = state;

  if (!blocks[synthSettings.output]) {
    commit("setOutput", blocks.length - 1);
  }

  store.dispatch("update");
};

// @todo fix this mess
export const update = ({ commit, state }) => {
  const { blocks, externalSourceBlocks, synthSettings } = state;

  let codeString = "";

  if (blocks.length === 0) {
    codeString = "hush()";
  } else {
    commit("setOutput", synthSettings.output || 0);

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

    Toastify({
      text: error,
      duration: 4000,
      close: true,
      gravity: "bottom",
      stopOnFocus: true,
      style: {
        background: "#b62424",
      },
    }).showToast();
  }
};

export const send = ({ state }) => {
  if (state.codeString) {
    post(state.codeString);

    localStorage.setItem(
      "externalSourceBlocks",
      JSON.stringify(state.externalSourceBlocks),
    );
    localStorage.setItem("blocks", JSON.stringify(state.blocks));
    localStorage.setItem("synthSettings", JSON.stringify(state.synthSettings));
  }
};

export const setSynthSettings = ({ commit }, payload) => {
  commit("setSynthSettings", payload);
};

export const setOutput = ({ state, commit }, payload) => {
  if (state.synthSettings.output === payload) return;

  commit("setOutput", payload);

  store.dispatch("update");
};

// History

export const setHistory = ({ commit, state }) => {
  const history = state.history;

  commit("setHistory", history);
  commit("setHistoryIndex", state.historyIndex + 1);
};

export const setHistoryIndex = ({ commit, state }, payload) => {
  if (state.historyIndex === payload) return;

  commit("setHistoryIndex", payload);
};

export const undo = ({ commit, state }) => {
  const historyIndex = deepCopy(state.historyIndex);
  const history = deepCopy(state.history);

  if (historyIndex < history.length - 1) {
    commit("setHistoryIndex", historyIndex + 1);
    commit("setBlocks", {
      blocks: [
        ...history[historyIndex + 1].blocks,
        ...history[historyIndex + 1].externalSourceBlocks,
      ],
      isUndoRedo: true,
    });
  }
};

export const redo = ({ commit, state }) => {
  const historyIndex = deepCopy(state.historyIndex);
  const history = deepCopy(state.history);

  if (historyIndex > 0) {
    commit("setHistoryIndex", historyIndex - 1);
    commit("setBlocks", {
      blocks: [
        ...history[historyIndex - 1].blocks,
        ...history[historyIndex - 1].externalSourceBlocks,
      ],
      isUndoRedo: true,
    });
  }
};
