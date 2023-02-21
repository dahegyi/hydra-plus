import { TYPE_SRC } from "../constants";

export default {
  // Blocks

  addBlock(state, block) {
    const defaultPosition = { x: 20, y: 60 };

    if (block.type === TYPE_SRC) {
      state.blocks.push({ ...block, position: defaultPosition });
    } else {
      state.externalSourceBlocks.push({ ...block, position: defaultPosition });
    }
  },

  setBlocks(state, blocks) {
    console.log(blocks);

    state.blocks = blocks.filter((block) => block.type === TYPE_SRC);

    state.externalSourceBlocks = blocks.filter(
      (block) => block.type !== TYPE_SRC
    );
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
  },

  // Synth Settings

  setSynthSettings(state, synthSettings) {
    state.synthSettings = synthSettings;
  },

  setOutput(state, output) {
    state.synthSettings.output = output;
  },

  // History

  setHistory(state, history) {
    state.history = history;
  },

  setHistoryIndex(state, index) {
    state.historyIndex = index;
  },
};
