import { deepCopy } from "@/utils/object-utils";

import {
  DEFAULT_POSITION,
  TYPE_SRC,
  TYPE_THREE,
  TYPE_EXTERNAL,
} from "@/constants";

export default {
  // RGB

  setRGB(state, { red, green, blue }) {
    state.r = red;
    state.g = green;
    state.b = blue;
  },

  // Focus

  setFocus(state, focused) {
    state.focused = focused;
  },

  setInputFocus(state, isInputFocused) {
    state.isInputFocused = isInputFocused;
  },

  // Blocks

  addParent(state, block) {
    if (block.type === TYPE_SRC) {
      state.blocks.push({ ...block, position: DEFAULT_POSITION });
    } else {
      state.externalSourceBlocks.push({ ...block, position: DEFAULT_POSITION });
    }
  },

  addChild(state, element) {
    state.focused.blocks.push(element);
  },

  setBlocks(state, blocks) {
    state.blocks = blocks.filter((block) => block.type === TYPE_SRC);
    state.externalSourceBlocks = blocks.filter(
      (block) => block.type === TYPE_EXTERNAL || block.type === TYPE_THREE,
    );
  },

  setBlockPosition(state, { index, type, position }) {
    if (type === TYPE_SRC) {
      state.blocks[index].position = position;
    } else {
      state.externalSourceBlocks[index].position = position;
    }
  },

  deleteParent(state, { type, index }) {
    if (type === TYPE_SRC) {
      state.blocks.splice(index, 1);
    } else {
      state.externalSourceBlocks.splice(index, 1);
    }
  },

  setCodeString(state, codeString) {
    state.codeString = codeString;
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

    state.history.unshift(
      deepCopy({
        blocks: state.blocks,
        externalSourceBlocks: state.externalSourceBlocks,
      }),
    );
  },

  setHistoryIndex(state, index) {
    state.historyIndex = index;
  },
};
