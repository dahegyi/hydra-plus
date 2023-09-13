import { deepCopy } from '../utils/object-utils'

export const addBlock = ({ commit, state }, payload) => {
  commit("addBlock", payload);
};

export const setBlocks = ({ commit }, payload) => {
  commit("setBlocks", { blocks: payload });
};

export const setBlockPosition = ({ commit }, payload) => {
  commit("setBlockPosition", payload);
};

export const deleteBlock = ({ commit }, payload) => {
  commit("deleteBlock", payload);
};

export const setSynthSettings = ({ commit }, payload) => {
  commit("setSynthSettings", payload);
};

export const setOutput = ({ commit }, payload) => {
  commit("setOutput", payload);
};

export const setHistory = ({ commit, state }, payload) => {
  const history = state.history;

  history.push(payload);

  commit("setHistory", history);
  commit("setHistoryIndex", state.historyIndex + 1);
};

export const setHistoryIndex = ({ commit }, payload) => {
  commit("setHistoryIndex", payload);
};

export const undo = ({ commit, state }) => {
  const historyIndex = deepCopy(state.historyIndex);
  const history = deepCopy(state.history);

  if (historyIndex === history.length - 1) {
    return;
  }

  commit("setHistoryIndex", historyIndex + 1);
  commit("setBlocks", { blocks: [...history[historyIndex + 1].blocks, ...history[historyIndex + 1].externalSourceBlocks], isUndoRedo: true });
};

export const redo = ({ commit, state }) => {
  const historyIndex = deepCopy(state.historyIndex);
  const history = deepCopy(state.history);

  if (historyIndex === 0) {
    return;
  }

  commit("setHistoryIndex", historyIndex - 1);
  commit("setBlocks", { blocks: [...history[historyIndex - 1].blocks, ...history[historyIndex - 1].externalSourceBlocks], isUndoRedo: true });
};
