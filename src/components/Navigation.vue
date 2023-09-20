<template>
  <div class="navigation">
    <div>
      <strong v-if="focused">{{ outputName }}</strong>

      <div class="dropdown">
        <button>new {{ isAddSourceVisible ? "source" : "effect" }}</button>
        <ul class="dropdown-content">
          <li
            v-if="isAddSourceVisible"
            v-for="source in sources"
            :class="source.type"
            @click="addSource(source)"
          >
            {{ source.name }}
          </li>

          <li
            v-else
            v-for="functions in functionGroups"
            :key="functions.name"
            class="dropdown"
          >
            {{ functions.name }}
            <ul class="dropdown-content">
              <li
                v-for="fn in functions.fns"
                :key="fn.name"
                @click="addEffect(fn)"
              >
                {{ fn.name }}
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>

    <div>
      <button @click="openThreeModal">3D settings</button>
      <button @click="openSettingsModal" class="settings">
        synth settings
      </button>
      <button @click="update" :disabled="isSettingsModalOpen" class="update">
        update
      </button>
      <button
        @click="updateAndSend"
        :disabled="isSettingsModalOpen"
        class="send"
      >
        send
      </button>
    </div>
  </div>
</template>
<script>
import { useBroadcastChannel } from "@vueuse/core";
const { post } = useBroadcastChannel({ name: "hydra-plus-channel" });

import { deepCopy, flattenExternal, flatten } from "../utils/object-utils";

import {
  TYPE_SRC,
  TYPE_EXTERNAL,
  TYPE_THREE,
  TYPE_SIMPLE,
  TYPE_COMPLEX,
  SOURCE_FUNCTIONS,
  EXTERNAL_SOURCE_FUNCTIONS,
  THREE_FUNCTIONS,
  GEOMETRY_FUNCTIONS,
  COLOR_FUNCTIONS,
  BLEND_FUNCTIONS,
  MODULATE_FUNCTIONS,
} from "../constants";
import { mapActions, mapGetters } from "vuex";

export default {
  name: "Navigation",

  emits: ["openThreeModal", "openSettingsModal", "onFocus"],

  props: {
    focused: {
      type: Object,
      default: null,
    },

    isThreeModalVisible: {
      type: Boolean,
      default: false,
    },

    isSettingsModalOpen: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    ...mapGetters(["blocks", "externalSourceBlocks", "synthSettings"]),

    outputName() {
      const blockIndex = this.blocks.findIndex(
        (block) => block === this.focused,
      );

      if (blockIndex >= 0) {
        return `o${blockIndex} - ${this.focused.name}`;
      }

      return this.focused.name;
    },

    isFocusNameVisible() {
      return this.outputName && this.focused?.name;
    },

    isAddSourceVisible() {
      return (
        this.focused?.type !== TYPE_SRC && this.focused?.type !== TYPE_SIMPLE
      );
    },

    sources() {
      return [
        ...SOURCE_FUNCTIONS.map((fn) => ({
          ...fn,
          type: TYPE_SRC,
          blocks: [],
        })),

        ...EXTERNAL_SOURCE_FUNCTIONS.map((fn) => ({
          ...fn,
          type: TYPE_EXTERNAL,
        })),

        ...THREE_FUNCTIONS.map((fn) => ({
          ...fn,
          type: TYPE_THREE,
        })),
      ];
    },

    functionGroups() {
      return [
        {
          name: "geometry",
          fns: GEOMETRY_FUNCTIONS.map((fn) => ({ ...fn, type: TYPE_SIMPLE })),
        },
        {
          name: "color",
          fns: COLOR_FUNCTIONS.map((fn) => ({ ...fn, type: TYPE_SIMPLE })),
        },
        {
          name: "blend",
          fns: BLEND_FUNCTIONS.map((fn) => ({ ...fn, type: TYPE_COMPLEX })),
        },
        {
          name: "modulate",
          fns: MODULATE_FUNCTIONS.map((fn) => ({ ...fn, type: TYPE_COMPLEX })),
        },
      ];
    },
  },

  methods: {
    ...mapActions(["addBlock", "setBlocks", "setOutput"]),

    onFocus(focusedBlock) {
      this.$emit("onFocus", focusedBlock, true);
    },

    /**
     * Adds source to the main code block or to a child block.
     * Deep copy is needed because we want to handle the input parameters
     * differently for different sources.
     */
    addSource(source) {
      const copiedObject = deepCopy(source);

      if (!this.focused) {
        if (
          (source.type === TYPE_SRC &&
            this.blocks.filter((block) => block.type === TYPE_SRC).length >=
              4) ||
          ((source.type === TYPE_EXTERNAL || source.type === TYPE_THREE) &&
            this.blocks.filter(
              (block) => block.type === TYPE_EXTERNAL || TYPE_THREE,
            ).length >= 4)
        ) {
          return;
        }

        this.addBlock(copiedObject);
        this.setOutput(this.blocks.length - 1);

        this.onFocus(this.blocks[this.blocks.length - 1]);
      } else {
        this.focused.blocks.push(copiedObject);
      }

      if (source.type === TYPE_EXTERNAL) {
        const addedExternal = flattenExternal(
          deepCopy(source),
          this.externalSourceBlocks.length - 1,
        );

        eval(addedExternal);
        post(addedExternal);
      } else {
        this.update();
      }
    },

    /**
     * Adds effect block to the focused block as a child.
     */
    addEffect(effect) {
      if (!this.focused) {
        return;
      }

      this.focused.blocks.push(deepCopy(effect));

      if (effect.type === TYPE_COMPLEX) {
        this.onFocus(this.focused.blocks[this.focused.blocks.length - 1]);
      }

      this.setBlocks({
        blocks: [...this.blocks, ...this.externalSourceBlocks],
      });

      this.update();
    },

    openThreeModal() {
      this.$emit("openThreeModal");
    },

    openSettingsModal() {
      this.$emit("openSettingsModal");
    },

    // @TODO: fix this mess
    update() {
      let codeString = "";

      if (this.blocks.length === 0) {
        codeString = "hush()";
      } else {
        if (!this.synthSettings.output) {
          this.setOutput(0);
        }

        for (let i = 0; i < this.externalSourceBlocks.length; i++) {
          if (this.externalSourceBlocks[i].name !== "initScreen") {
            codeString += flattenExternal(this.externalSourceBlocks[i], i);
          }
        }

        for (let i = 0; i < this.blocks.length; i++) {
          codeString += `${flatten(this.blocks[i])}.out(o${i})\n`;
        }

        codeString += `window.hydra.render(o${this.synthSettings.output})`;
      }

      try {
        eval(codeString);
        this.error = null;

        return codeString;
      } catch (error) {
        this.error = error;
        console.error(error);
      }
    },

    updateAndSend() {
      const codeString = this.update();

      if (codeString) {
        post(codeString);

        localStorage.setItem(
          "externalSourceBlocks",
          JSON.stringify(this.externalSourceBlocks),
        );
        localStorage.setItem("blocks", JSON.stringify(this.blocks));
        localStorage.setItem(
          "synthSettings",
          JSON.stringify(this.synthSettings),
        );
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.navigation {
  position: fixed;
  width: calc(100% - 12px);
  top: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px;
  background: #151515dd;
  backdrop-filter: blur(6px);
  z-index: 1;

  div {
    display: flex;
    align-items: center;

    * {
      margin-right: 0.5rem;

      &:last-child {
        margin-right: 0;
      }
    }
  }

  @mixin dropdown {
    display: none;

    button {
      margin: 0;
      cursor: pointer;
    }

    > .dropdown-content {
      display: none;
      position: absolute;
      flex-direction: column;
      list-style: none;
      top: 0;
      left: 0;
      margin: 0 100% 0;
      padding: 0;
      background-color: #222;
      z-index: 1;

      li {
        margin: 0;
        padding: 0.5rem 1rem;
        min-width: 160px;
        cursor: pointer;

        &.external {
          background-color: #333;
        }

        &.three {
          background-color: #555;
        }

        &:hover {
          background-color: #111;
        }
      }
    }

    &:hover > .dropdown-content {
      display: block;
    }
  }

  .dropdown {
    @include dropdown;

    position: relative;
    display: flex;

    .dropdown-content {
      @include dropdown;
      border: 3px solid #111;
    }
  }

  button {
    &.settings {
      margin-right: 2rem;
    }

    &.update {
      border: 3px solid #bda22d;
    }

    &.send {
      border: 3px solid #b62424;
    }
  }
}
</style>
