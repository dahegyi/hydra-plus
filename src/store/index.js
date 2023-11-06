import { createStore, createLogger } from "vuex";
import * as getters from "./getters";
import * as actions from "./actions";
import mutations from "./mutations";

import { INITIAL_BLOCKS } from "../constants";

const state = {
  r: "1",
  g: "1",
  b: "1",
  focused: null,
  isInputFocused: false,
  blocks: INITIAL_BLOCKS,
  externalSourceBlocks: [],
  synthSettings: {
    bpm: 30,
    speed: 1,
    output: null,
    resolution: 100,
    fps: 60,
  },
  codeString: "",
  history: [],
  historyIndex: 0,
};

export default createStore({
  state,
  getters,
  actions,
  mutations,
  plugins:
    process.env.NODE_ENV !== "production"
      ? [createLogger({ logActions: false, logMutations: false })]
      : [],
});
