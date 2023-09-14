import store from './';

import { deepCopy } from '../utils/object-utils'

import { DEFAULT_POSITION, TYPE_SRC } from "../constants";

export default {
  // Blocks

  addBlock(state, block) {
    if (block.type === TYPE_SRC) {
      state.blocks.push({ ...block, position: DEFAULT_POSITION });
    } else {
      state.externalSourceBlocks.push({ ...block, position: DEFAULT_POSITION });
    }

    store.commit("setHistory");
  },

  setBlocks(state, { blocks, isUndoRedo }) {
    state.blocks = blocks.filter((block) => block.type === TYPE_SRC);
    state.externalSourceBlocks = blocks.filter((block) => block.type !== TYPE_SRC);

    if (!isUndoRedo) store.commit("setHistory");
  },

  setBlockPosition(state, { index, type, position }) {
    if (type === TYPE_SRC) {
      state.blocks[index].position = position;
    } else {
      state.externalSourceBlocks[index].position = position;
    }
  },

  deleteBlock(state, { type, index }) {
    if (type === TYPE_SRC) {
      state.blocks.splice(index, 1);
    } else {
      state.externalSourceBlocks.splice(index, 1);
    }

    store.commit("setHistory");
  },

  // Synth Settings

  setSynthSettings(state, synthSettings) {
    state.synthSettings = synthSettings;
  },

  setOutput(state, output) {
    state.synthSettings.output = output;
  },

  // History

  setHistory(state) {
    if (state.history.length > 99) {
      state.history.pop();
    }

    state.history.splice(0, state.historyIndex);

    store.commit("setHistoryIndex", 0);

    state.history = [deepCopy({ blocks: state.blocks, externalSourceBlocks: state.externalSourceBlocks }), ...state.history]
  },

  setHistoryIndex(state, index) {
    state.historyIndex = index;
  },
};
