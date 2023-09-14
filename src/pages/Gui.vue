<template>
  <welcome-modal v-if="isWelcomeModalOpen" @close="closeWelcomeModal" />

  <three-modal
    v-if="isThreeModalOpen"
    @close="closeThreeModal"
    @closeAndSave="saveAndCloseThreeModal"
  />

  <settings-modal
    v-if="isSettingsModalOpen"
    @close="closeSettingsModal"
    @closeAndSave="saveAndCloseSettingsModal"
  />

  <div class="playground" @click="removeFocus" />

  <navigation
    :focused="focused"
    :isThreeModalOpen="isThreeModalOpen"
    @openThreeModal="openThreeModal"
    :isSettingsModalOpen="isSettingsModalOpen"
    @openSettingsModal="openSettingsModal"
    @onFocus="onFocus"
  />

  <div>
    <div
      v-for="(block, index) in blocks"
      :key="'src-block-' + index"
      :id="'src-block-' + index"
      :class="['source', { focused: focused === block }]"
    >
      <div @click="onFocus(index)">
        <strong
          class="output-header"
          @mousedown="(e) => moveBlock(e, index, block.type)"
        >
          <span>o{{ index }} - {{ block.name }}</span>
          <div>
            <span
              :class="['activate', { active: synthSettings.output === index }]"
              @click="setOutput(index)"
            />
            <span
              class="delete"
              @click="deleteBlock({ type: block.type, index })"
            />
          </div>
        </strong>
        <div v-if="block.name === 'src'" class="param-input-container">
          <label>{{ block.params[0].name }}</label>
          <select v-model="block.params[0].value">
            <option
              v-for="(source, sIndex) in externalSourceBlocks"
              :value="'s' + sIndex"
            >
              s{{ sIndex }} - {{ source.name }}
            </option>
            <option v-for="(output, oIndex) in blocks" :value="'o' + oIndex">
              o{{ oIndex }} - {{ output.name }}
            </option>
          </select>
        </div>
        <div
          v-else
          v-for="(param, paramIndex) in block.params"
          :key="paramIndex"
          class="param-input-container"
        >
          <label>{{ param.name }}</label>
          <input type="text" v-model="param.value" />
        </div>
      </div>

      <nested-draggable
        :children="block.blocks"
        :focused="focused"
        :parent="block"
        @onFocus="onFocus"
      />
    </div>

    <div
      v-for="(block, index) in externalSourceBlocks"
      :key="'ext-block-' + index"
      :id="'ext-block-' + index"
      class="source external"
    >
      <strong
        class="output-header"
        @mousedown="(e) => moveBlock(e, index, block.type)"
      >
        <span>s{{ index }} - {{ block.name }}</span>
        <div>
          <span
            class="delete"
            @click="deleteBlock({ type: block.type, index })"
          />
        </div>
      </strong>
      <div
        v-for="(param, paramIndex) in block.params"
        :key="paramIndex"
        class="param-input-container"
      >
        <label :for="paramIndex">{{ param.name }}</label>
        <input
          :id="index + param.name + paramIndex"
          type="text"
          v-model="param.value"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { useBroadcastChannel } from "@vueuse/core";
const { post } = useBroadcastChannel({ name: "hydra-plus-channel" });

import { mapGetters, mapActions } from "vuex";

import { INITIAL_BLOCKS, TYPE_EXTERNAL, TYPE_SRC } from "../constants";

import WelcomeModal from "../components/WelcomeModal.vue";
import ThreeModal from "../components/ThreeModal.vue";
import SettingsModal from "../components/SettingsModal.vue";
import Navigation from "../components/Navigation.vue";
import NestedDraggable from "../components/Draggable.vue";

export default {
  Name: "Gui",

  components: {
    WelcomeModal,
    ThreeModal,
    SettingsModal,
    Navigation,
    NestedDraggable,
  },

  data() {
    return {
      error: null,
      focused: null,
      isWelcomeModalOpen: false,
      isThreeModalOpen: false,
      isSettingsModalOpen: false,
    };
  },

  mounted() {
    // show welcome modal
    if (localStorage.getItem("welcomeModalClosed")) {
      this.isWelcomeModalOpen = false;
    } else {
      this.isWelcomeModalOpen = true;
    }

    // load stuff from local storage
    const blocks = [];

    if (localStorage.getItem("blocks")) {
      blocks.push(...JSON.parse(localStorage.getItem("blocks")));
    } else {
      blocks.push(...JSON.parse(INITIAL_BLOCKS));
    }

    if (localStorage.getItem("externalSourceBlocks")) {
      blocks.push(...JSON.parse(localStorage.getItem("externalSourceBlocks")));
    }

    this.setBlocks({ blocks });

    if (localStorage.getItem("synthSettings")) {
      this.setSynthSettings(JSON.parse(localStorage.getItem("synthSettings")));
    }

    // set up keyboard shortcuts
    const onKeyDown = (e) => {
      const isUndoKey =
        e.keyCode === 90 && !e.shiftKey && (e.ctrlKey || e.metaKey);
      const isRedoKey =
        (e.keyCode === 89 && (e.ctrlKey || e.metaKey)) ||
        (e.keyCode === 90 && e.shiftKey && (e.ctrlKey || e.metaKey));

      if (isUndoKey) {
        e.preventDefault();
        this.undo();
      } else if (isRedoKey) {
        e.preventDefault();
        this.redo();
      }
    };

    document.onkeydown = onKeyDown;
  },

  updated() {
    // move parent blocks and external source blocks to their position
    this.blocks.map((block, index) => {
      this.moveBlock(block, index, TYPE_SRC, block.position);
    });
    this.externalSourceBlocks.map((block, index) => {
      this.moveBlock(block, index, TYPE_EXTERNAL, block.position);
    });
  },

  computed: {
    ...mapGetters([
      "blocks",
      "externalSourceBlocks",
      "synthSettings",
      "history",
    ]),
  },

  methods: {
    ...mapActions([
      "setBlocks",
      "setBlockPosition",
      "deleteBlock",
      "setSynthSettings",
      "setOutput",
      "setHistory",
      "undo",
      "redo",
    ]),

    moveBlock(e, index, type, position) {
      let div;

      if (type === TYPE_SRC) {
        div = document.getElementById("src-block-" + index);
      } else {
        div = document.getElementById("ext-block-" + index);
      }

      const divRect = div.getBoundingClientRect();

      const offsetX = e.clientX - divRect.left;
      const offsetY = e.clientY - divRect.top;

      if (position) {
        return (div.style.transform = `translate(${position.x}px, ${position.y}px)`);
      }

      const move = (e) => {
        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;

        div.style.transform = `translate(${x}px, ${y}px)`;

        this.setBlockPosition({ index, type, position: { x, y } });
      };

      const up = () => {
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);

        // This is to be able to undo/redo the moving of a block
        this.setBlocks({
          blocks: [...this.blocks, ...this.externalSourceBlocks],
        });
      };

      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    },

    onFocus(index, fromChildComponent) {
      if (fromChildComponent) {
        this.focused = index;
      } else {
        this.focused = this.blocks[index];
      }
    },

    removeFocus() {
      this.focused = null;
    },

    closeWelcomeModal() {
      this.isWelcomeModalOpen = false;
      localStorage.setItem("welcomeModalClosed", true);
    },

    openThreeModal() {
      this.isThreeModalOpen = true;
    },

    closeThreeModal() {
      this.isThreeModalOpen = false;
    },

    openSettingsModal() {
      this.isSettingsModalOpen = true;
    },

    closeSettingsModal() {
      this.isSettingsModalOpen = false;
    },

    saveAndCloseSettingsModal() {
      eval(`bpm = ${this.synthSettings.bpm}`);
      post(`bpm = ${this.synthSettings.bpm}`);

      eval(`speed = ${this.synthSettings.speed}`);
      post(`speed = ${this.synthSettings.speed}`);

      const multiplier =
        (this.synthSettings.resolution * window.devicePixelRatio) / 100;

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

      eval(`fps = ${this.synthSettings.fps}`);
      post(`fps = ${this.synthSettings.fps}`);

      this.closeSettingsModal();
    },
  },
};
</script>

<style lang="scss" scoped>
$darkblue: #02042c;

.playground {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.source {
  position: absolute;
  display: flex;
  flex-direction: column;
  width: fit-content;
  min-width: 300px;
  padding: 1rem;
  border-radius: 10px;
  background: #22222280;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);

  .output-header {
    color: $darkblue;
    padding: 6px;
    display: flex;
    justify-content: space-between;
    background: #fff;
    border: 1px solid $darkblue;
    border-radius: 6px;
    margin-bottom: 0.5rem;
    cursor: move;

    $iconSize: 21px;

    .activate,
    .delete {
      position: absolute;
      height: $iconSize;
      width: $iconSize;
      cursor: pointer;
    }

    .activate {
      right: calc(2 * $iconSize);

      &:after {
        content: "";
        position: absolute;
        border: 4px solid $darkblue;
        height: calc($iconSize / 3);
        width: calc($iconSize / 3);
        border-radius: 50%;
        top: 25%;
        left: 25%;
      }

      &.active {
        &:after {
          border-color: #f55858;
        }
      }
    }

    .delete {
      right: $iconSize;

      &:before,
      &:after {
        content: "";
        position: absolute;
        border-top: 3px solid $darkblue;
        width: 16px;
        top: 50%;
        left: 10%;
      }

      &:before {
        transform: rotate(45deg);
      }

      &:after {
        transform: rotate(-45deg);
      }
    }
  }

  &:not(.external) {
    $offset-top: -200%;
    $bottom-color: #38383880;
    $offset-bottom: 150%;

    &:nth-child(1) {
      $color: #fff70080;
      background: linear-gradient(
        180deg,
        $color $offset-top,
        $bottom-color $offset-bottom
      );

      &.focused {
        background: linear-gradient(
          180deg,
          $color calc($offset-top / 2),
          $bottom-color calc($offset-bottom * 2)
        );
      }

      .output-header {
        background: $color;
      }
    }

    &:nth-child(2) {
      $color: #b8f77080;
      background: linear-gradient(
        180deg,
        $color $offset-top,
        $bottom-color $offset-bottom
      );

      &.focused {
        background: linear-gradient(
          180deg,
          $color calc($offset-top / 2),
          $bottom-color calc($offset-bottom * 2)
        );
      }

      .output-header {
        background: $color;
      }
    }

    &:nth-child(3) {
      $color: #3bd5f080;
      background: linear-gradient(
        180deg,
        $color $offset-top,
        $bottom-color $offset-bottom
      );

      &.focused {
        background: linear-gradient(
          180deg,
          $color calc($offset-top / 2),
          $bottom-color calc($offset-bottom * 2)
        );
      }

      .output-header {
        background: $color;
      }
    }

    &:nth-child(4) {
      $color: #ff8fec80;
      background: linear-gradient(
        180deg,
        $color $offset-top,
        $bottom-color $offset-bottom
      );

      &.focused {
        background: linear-gradient(
          180deg,
          $color calc($offset-top / 2),
          $bottom-color calc($offset-bottom * 2)
        );
      }

      .output-header {
        background: $color;
      }
    }
  }

  &.external {
    .output-header {
      color: #000;
      background: #f1a3a3;
    }
  }
}
</style>
