import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import { useBroadcastChannel } from "@vueuse/core";
import { deepCopy, flatten, flattenExternal } from "@/utils/object-utils";
import { showToast, setHueLights } from "@/utils";
import {
  INITIAL_BLOCKS,
  MAX_NUMBER_OF_SOURCES,
  MAX_NUMBER_OF_EXTERNALS,
  TYPE_SRC,
  TYPE_THREE,
  TYPE_EXTERNAL,
  TYPE_COMPLEX,
  DEFAULT_POSITION,
} from "@/constants";

export const useHydraStore = defineStore("hydra", () => {
  // State
  const r = ref(0);
  const g = ref(0);
  const b = ref(0);
  const focused = ref(null);
  const isInputFocused = ref(false);
  const blocks = ref(INITIAL_BLOCKS);
  const externalSourceBlocks = ref([]);
  const synthSettings = reactive({
    output: 0,
    bpm: 120,
    speed: 1,
    resolution: 100,
    fps: 60,
  });
  const saved = ref({});
  const codeString = ref("");
  const history = ref([]);
  const historyIndex = ref(0);
  const { post } = useBroadcastChannel({ name: "hydra-plus-channel" });

  // Actions
  const updateRGB = ({ red, green, blue }) => {
    r.value = red;
    g.value = green;
    b.value = blue;
    update({ shouldSetHistory: false });
  };

  const setFocus = (newFocus) => {
    focused.value = newFocus;
  };

  const setInputFocus = (isFocused) => {
    isInputFocused.value = isFocused;
  };

  const addParent = (source) => {
    const copiedSource = deepCopy(source);

    if (
      source.type === TYPE_SRC &&
      blocks.value.length >= MAX_NUMBER_OF_SOURCES
    ) {
      showToast(`You can't add more than ${MAX_NUMBER_OF_SOURCES} sources.`);
      return;
    }

    if (
      (source.type === TYPE_EXTERNAL || source.type === TYPE_THREE) &&
      externalSourceBlocks.value.length >= MAX_NUMBER_OF_EXTERNALS
    ) {
      showToast(
        `You can't add more than ${MAX_NUMBER_OF_EXTERNALS} externals.`,
      );
      return;
    }

    const newBlock = { ...copiedSource, position: DEFAULT_POSITION };
    if (source.type === TYPE_SRC) {
      blocks.value.push(newBlock);
    } else {
      externalSourceBlocks.value.push(newBlock);
    }

    focused.value = newBlock;
    synthSettings.output = blocks.value.length - 1;

    if (source.type === TYPE_EXTERNAL) {
      const addedExternal = flattenExternal(
        copiedSource,
        externalSourceBlocks.value.length - 1,
      );
      eval(addedExternal);
      post(addedExternal);
    } else {
      setBlocks({
        blocks: [...blocks.value, ...externalSourceBlocks.value],
      });
    }
  };

  const addChild = (effect) => {
    if (!focused.value) return;

    focused.value.blocks.push(deepCopy(effect));

    if (effect.type === TYPE_COMPLEX) {
      focused.value = focused.value.blocks[focused.value.blocks.length - 1];
    }

    setBlocks({
      blocks: [...blocks.value, ...externalSourceBlocks.value],
    });
  };

  const setBlocks = ({
    blocks: newBlocks,
    shouldSetHistory = true,
    isDelete = false,
  }) => {
    const newSrcBlocks = newBlocks.filter((block) => block.type === TYPE_SRC);
    const newExternalBlocks = newBlocks.filter((block) =>
      [TYPE_EXTERNAL, TYPE_THREE].includes(block.type),
    );

    // if (
    //   JSON.stringify(newSrcBlocks) === JSON.stringify(blocks.value) &&
    //   JSON.stringify(newExternalBlocks) ===
    //     JSON.stringify(externalSourceBlocks.value)
    // ) {
    //   debugger;
    //   return;
    // }

    blocks.value = newSrcBlocks;
    externalSourceBlocks.value = newExternalBlocks;
    update({ shouldSetHistory, isDelete });
  };

  const setBlockPosition = ({ index, type, position }) => {
    if (type === TYPE_SRC) {
      blocks.value[index].position = position;
    } else {
      externalSourceBlocks.value[index].position = position;
    }
    setHistory();
  };

  const deleteParent = ({ type, index }) => {
    if (type === TYPE_SRC) {
      blocks.value.splice(index, 1);
    } else {
      externalSourceBlocks.value.splice(index, 1);
    }

    if (!blocks.value[synthSettings.output] && blocks.value.length > 0) {
      synthSettings.output = blocks.value.length - 1;
    }

    setBlocks({
      blocks: [...blocks.value, ...externalSourceBlocks.value],
      shouldSetHistory: true,
      isDelete: true,
    });
  };

  const deleteChild = ({ element, children, parent }) => {
    for (const child of children) {
      if (child === element) {
        if (focused.value !== parent) setFocus(parent);

        // @todo probably not the best way to do this
        children.splice(children.indexOf(child), 1);

        setBlocks({
          blocks: [...blocks.value, ...externalSourceBlocks.value],
        });
      }
    }
  };

  const update = async (
    { shouldSetHistory, isDelete } = {
      shouldSetHistory: true,
      isDelete: false,
    },
  ) => {
    const isHuePluginEnabled = false && process.env.NODE_ENV !== "production";
    let newCodeString = "";

    if (blocks.value.length === 0) {
      newCodeString = "hush()";
    } else {
      if (!blocks.value[synthSettings.output]) {
        synthSettings.output = 0;
      }

      for (const [i, block] of externalSourceBlocks.value.entries()) {
        if (
          block.type !== TYPE_THREE &&
          (isDelete || !window.hydra[`s${i}`]?.src)
        ) {
          newCodeString += flattenExternal(block, i);
        }
      }

      if (isHuePluginEnabled) {
        setHueLights({ r: r.value, g: g.value, b: b.value });
      }

      for (const [i, block] of blocks.value.entries()) {
        newCodeString += `${flatten(block)}`;

        if (isHuePluginEnabled) {
          newCodeString += `.color(${r.value}, ${g.value}, ${b.value}, 1)`;
        }

        newCodeString += `.out(o${i})\n`;
      }

      newCodeString += `window.hydra.render(o${synthSettings.output})`;
    }

    try {
      eval(newCodeString);
      codeString.value = newCodeString;
    } catch (error) {
      showToast(error);
    }

    if (shouldSetHistory) setHistory();
  };

  const send = () => {
    if (codeString.value) {
      post(codeString.value);

      localStorage.setItem("blocks", JSON.stringify(blocks.value));
      localStorage.setItem(
        "externalSourceBlocks",
        JSON.stringify(externalSourceBlocks.value),
      );

      setSynthSettings(synthSettings);
    }
  };

  const setSynthSettings = (settings) => {
    if (settings === synthSettings) return;

    eval(`bpm = ${settings.bpm}`);
    post(`bpm = ${settings.bpm}`);
    eval(`speed = ${settings.speed}`);
    post(`speed = ${settings.speed}`);

    const multiplier = (settings.resolution * window.devicePixelRatio) / 100;
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

    eval(`fps = ${settings.fps}`);
    post(`fps = ${settings.fps}`);

    Object.assign(synthSettings, settings);
    localStorage.setItem("synthSettings", JSON.stringify(synthSettings));
  };

  const setOutput = (output) => {
    if (synthSettings.output === output) return;

    synthSettings.output = output;
    update();
  };

  // History

  const setHistory = () => {
    if (history.value.length > 99) history.value.pop();

    history.value.splice(0, historyIndex.value);
    history.value.unshift(
      deepCopy({
        blocks: blocks.value,
        externalSourceBlocks: externalSourceBlocks.value,
      }),
    );

    historyIndex.value = 0;
  };

  /**
   * @param {Number} direction 1 for undo, -1 for redo
   */
  const undoRedo = (direction) => {
    const newIndex = historyIndex.value + direction;
    if (newIndex < 0 || newIndex >= history.value.length) return;

    historyIndex.value = newIndex;
    const historyState = history.value[newIndex];

    setBlocks({
      blocks: deepCopy([
        ...historyState.blocks,
        ...historyState.externalSourceBlocks,
      ]),
      shouldSetHistory: false,
    });
  };

  return {
    // State
    r,
    g,
    b,
    focused,
    isInputFocused,
    blocks,
    externalSourceBlocks,
    codeString,
    synthSettings,
    saved,
    history,
    historyIndex,

    // Actions
    updateRGB,
    setFocus,
    setInputFocus,
    addParent,
    addChild,
    setBlocks,
    setBlockPosition,
    deleteParent,
    deleteChild,
    update,
    send,
    setSynthSettings,
    setOutput,
    setHistory,
    undoRedo,
  };
});
