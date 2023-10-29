<template>
  <welcome-modal v-if="isWelcomeModalOpen" @close="closeWelcomeModal" />

  <three-modal
    v-if="isThreeModalOpen"
    @close="closeThreeModal"
    @saveAndClose="saveAndCloseThreeModal"
  />

  <settings-modal
    v-if="isSettingsModalOpen"
    @close="closeSettingsModal"
    @saveAndClose="saveAndCloseSettingsModal"
  />

  <div class="playground" @click="() => setFocus(null)" />

  <navigation
    @openThreeModal="openThreeModal"
    @openSettingsModal="openSettingsModal"
    :class="{ hidden: areBlocksHidden }"
  />

  <div :class="{ hidden: areBlocksHidden }">
    <div
      v-for="(block, index) in blocks"
      :key="'src-block-' + index"
      :id="'src-block-' + index"
      :class="['source', { focused: focused === block }]"
    >
      <div @click="() => setFocus(blocks[index])">
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
          <input type="text" v-model="param.value" @focusout="update" />
        </div>
      </div>

      <nested-draggable :children="block.blocks" :parent="block" />
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
import { defineAsyncComponent } from "vue";
import { useBroadcastChannel } from "@vueuse/core";
const { post } = useBroadcastChannel({ name: "hydra-plus-channel" });

import { mapGetters, mapActions } from "vuex";

import { INITIAL_BLOCKS, TYPE_EXTERNAL, TYPE_SRC } from "@/constants";

import Navigation from "@/components/Navigation.vue";
import NestedDraggable from "@/components/Draggable.vue";

export default {
  Name: "Gui",

  components: {
    WelcomeModal: defineAsyncComponent(() =>
      import("@/components/WelcomeModal.vue"),
    ),
    ThreeModal: defineAsyncComponent(() =>
      import("@/components/ThreeModal.vue"),
    ),
    SettingsModal: defineAsyncComponent(() =>
      import("@/components/SettingsModal.vue"),
    ),
    Navigation,
    NestedDraggable,
  },

  data() {
    return {
      areBlocksHidden: false,
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
      if (e.ctrlKey || e.metaKey) {
        if (e.keyCode === 90 && !e.shiftKey) {
          e.preventDefault();
          return this.undo();
        }

        if (e.keyCode === 89 || (e.keyCode === 90 && e.shiftKey)) {
          e.preventDefault();
          return this.redo();
        }
      }

      if (e.key === "Escape") {
        return (this.areBlocksHidden = !this.areBlocksHidden);
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
      "focused",
      "blocks",
      "externalSourceBlocks",
      "synthSettings",
      "history",
    ]),
  },

  methods: {
    ...mapActions([
      "setFocus",
      "setBlocks",
      "setBlockPosition",
      "deleteBlock",
      "update",
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

    saveAndCloseThreeModal() {
      this.closeThreeModal();
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

.hidden {
  display: none;
}

.source {
  position: absolute;
  display: flex;
  flex-direction: column;
  width: fit-content;
  min-width: 320px;
  padding: 1rem;
  border-radius: 12px;
  background: #222222aa;
  backdrop-filter: blur(6px);

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
    $offset-top: -300%;
    $color: #ffffff;
    $bottom-color: #38383890;
    $offset-bottom: 150%;

    @mixin block-colors {
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

    &:nth-child(1) {
      $color: #fff700;
      @include block-colors();
    }

    &:nth-child(2) {
      $color: #b8f770;
      @include block-colors();
    }

    &:nth-child(3) {
      $color: #3bd5f0;
      @include block-colors();
    }

    &:nth-child(4) {
      $color: #ff8fec;
      @include block-colors();
    }

    &:nth-child(5) {
      $color: #9063f3;
      @include block-colors();
    }

    &:nth-child(6) {
      $color: #ef8c56;
      @include block-colors();
    }

    &:nth-child(7) {
      $color: #4282d6;
      @include block-colors();
    }

    &:nth-child(8) {
      $color: #ea7979;
      @include block-colors();
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
