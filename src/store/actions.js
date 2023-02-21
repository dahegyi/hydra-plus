export const addBlock = ({ commit }, payload) => {
  commit("addBlock", payload);
};

export const setBlocks = ({ commit }, payload) => {
  commit("setBlocks", payload);
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
  const history = state.history.splice(0, state.historyIndex + 1);
  history.push(payload);

  commit("setHistory", history);
  commit("setHistoryIndex", history.length - 1);
};

export const setHistoryIndex = ({ commit }, payload) => {
  commit("setHistoryIndex", payload);
};

export const undo = ({ commit, state }) => {
  if (state.historyIndex === 0) {
    return;
  }
  const historyIndex = state.historyIndex;


  commit("setHistoryIndex", historyIndex);
  commit("setBlocks", state.history[historyIndex - 1]);
};

export const redo = ({ commit, state }) => {
  if (state.historyIndex === state.history.length) {
    return;
  }
  const historyIndex = state.historyIndex;

  commit("setHistoryIndex", historyIndex);
  commit("setBlocks", state.history[historyIndex - 1]);
};
