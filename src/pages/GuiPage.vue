<template>
  <welcome-modal v-if="isWelcomeModalOpen" @close="closeWelcomeModal" />

  <three-modal v-if="isThreeModalOpen" @close="closeThreeModal" />

  <settings-modal v-if="isSettingsModalOpen" @close="closeSettingsModal" />

  <div class="playground" @click="() => focused && setFocus(null)" />

  <navigation-panel
    :class="{ hidden: areBlocksHidden }"
    @open-three-modal="openThreeModal"
    @open-settings-modal="openSettingsModal"
  />

  <div :class="{ hidden: areBlocksHidden }">
    <div
      v-for="(block, index) in blocks"
      :id="'src-block-' + index"
      :key="'src-block-' + index"
      :class="['source', { focused: focused === block }]"
    >
      <div @click="() => handleHeaderClick(blocks[index])">
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
              @click="deleteParent({ type: block.type, index })"
            />
          </div>
        </strong>
        <div v-if="block.name === 'src'" class="param-input-container">
          <label>{{ block.params[0].name }}</label>
          <select v-model="block.params[0].value">
            <option
              v-for="(source, sIndex) in externalSourceBlocks"
              :key="'s' + sIndex"
              :value="'s' + sIndex"
            >
              s{{ sIndex }} - {{ source.name }}
            </option>
            <option
              v-for="(output, oIndex) in blocks"
              :key="'o' + oIndex"
              :value="'o' + oIndex"
            >
              o{{ oIndex }} - {{ output.name }}
            </option>
          </select>
        </div>
        <div
          v-for="(param, paramIndex) in block.params"
          v-else
          :key="paramIndex"
          class="param-input-container"
        >
          <label>{{ param.name }}</label>
          <input v-model="param.value" type="text" @focusout="handleChange" />
        </div>
      </div>

      <nested-draggable
        :children="block.blocks"
        :parent="block"
        :handle-change="handleChange"
      />
    </div>

    <div
      v-for="(block, index) in externalSourceBlocks"
      :id="'ext-block-' + index"
      :key="'ext-block-' + index"
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
            @click="deleteParent({ type: block.type, index })"
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
          v-model="param.value"
          type="text"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { mapGetters, mapActions } from "vuex";

import { deepCopy } from "~/utils/object-utils";

import { INITIAL_BLOCKS, TYPE_EXTERNAL, TYPE_SRC } from "~/constants";

import NavigationPanel from "~/components/NavigationPanel";
import NestedDraggable from "~/components/NestedDraggable";

export default {
  components: {
    WelcomeModal: defineAsyncComponent(() =>
      import("~/components/WelcomeModal"),
    ),
    ThreeModal: defineAsyncComponent(() => import("~/components/ThreeModal")),
    SettingsModal: defineAsyncComponent(() =>
      import("~/components/SettingsModal"),
    ),
    NavigationPanel,
    NestedDraggable,
  },

  data() {
    return {
      prevBlocks: [this.blocks, this.externalSourceBlocks],
      movedBlockCoordinates: { x: 0, y: 0 },
      areBlocksHidden: false,
      isWelcomeModalOpen: false,
      isThreeModalOpen: false,
      isSettingsModalOpen: false,
    };
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

    if (localStorage.getItem("synthSettings")) {
      this.setSynthSettings(JSON.parse(localStorage.getItem("synthSettings")));
    }

    this.setBlocks({ blocks });

    // set up keyboard shortcuts
    const onKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        // undo
        if (e.keyCode === 90 && !e.shiftKey) {
          e.preventDefault();
          return this.undoRedo(1);
        }

        // redo
        if (e.keyCode === 89 || (e.keyCode === 90 && e.shiftKey)) {
          e.preventDefault();
          return this.undoRedo(-1);
        }
      }

      // toggle blocks
      if (e.key === "Escape") {
        if (this.isSettingsModalOpen) {
          return this.closeSettingsModal();
        } else if (this.isThreeModalOpen) {
          return this.closeThreeModal();
        }

        return (this.areBlocksHidden = !this.areBlocksHidden);
      }
    };

    document.onkeydown = onKeyDown;
  },

  updated() {
    // move source blocks to their position
    this.blocks.map((block, index) => {
      this.moveBlock(block, index, TYPE_SRC, block.position);
    });
    this.externalSourceBlocks.map((block, index) => {
      this.moveBlock(block, index, TYPE_EXTERNAL, block.position);
    });
  },

  methods: {
    ...mapActions([
      "setFocus",
      "setBlocks",
      "setBlockPosition",
      "deleteParent",
      "setSynthSettings",
      "setOutput",
      "undoRedo",
    ]),

    handleHeaderClick(clickedBlock) {
      if (this.focused === clickedBlock) return;

      this.setFocus(clickedBlock);
    },

    handleChange() {
      const newBlocks = [...this.blocks, ...this.externalSourceBlocks];

      if (JSON.stringify(newBlocks) === JSON.stringify(this.prevBlocks)) return;

      this.setBlocks({ blocks: newBlocks });

      this.prevBlocks = deepCopy(newBlocks);
    },

    moveBlock(e, index, type, position) {
      let div;
      let positionChanged = false;

      if (type === TYPE_SRC) {
        div = document.getElementById("src-block-" + index);
      } else {
        div = document.getElementById("ext-block-" + index);
      }

      if (position) {
        return (div.style.transform = `translate(${position.x}px, ${position.y}px)`);
      }

      const divRect = div.getBoundingClientRect();

      const offsetX = e.clientX - divRect.left;
      const offsetY = e.clientY - divRect.top;

      const x = e.clientX - offsetX;
      const y = e.clientY - offsetY;

      this.movedBlockCoordinates = { x, y };

      const move = (e) => {
        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;

        this.movedBlockCoordinates = { x, y };
        div.style.transform = `translate(${x}px, ${y}px)`;

        // not ultimately true, but the chance of moving the block to the exact same position is low
        positionChanged = true;
      };

      const up = () => {
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);

        if (!positionChanged) {
          return;
        }

        this.setBlockPosition({
          index,
          type,
          position: this.movedBlockCoordinates,
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
  },
};
</script>

<style lang="scss" scoped>
$darkblue: #02042c;

.playground {
  position: fixed;
  z-index: 0;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.hidden {
  display: none;
}

.source {
  position: absolute;
  display: flex;
  width: fit-content;
  min-width: 320px;
  flex-direction: column;
  padding: 1rem;
  border-radius: 12px;
  backdrop-filter: blur(6px);
  background: #222222aa;

  .output-header {
    display: flex;
    justify-content: space-between;
    padding: 6px;
    border: 1px solid $darkblue;
    border-radius: 6px;
    margin-bottom: 0.5rem;
    background: #fff;
    color: $darkblue;
    cursor: move;

    $iconSize: 21px;

    .activate,
    .delete {
      position: absolute;
      width: $iconSize;
      height: $iconSize;
      cursor: pointer;
    }

    .activate {
      right: calc(2 * $iconSize);

      &:after {
        position: absolute;
        top: 25%;
        left: 25%;
        width: calc($iconSize / 3);
        height: calc($iconSize / 3);
        border: 4px solid $darkblue;
        border-radius: 50%;
        content: "";
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
        position: absolute;
        top: 50%;
        left: 10%;
        width: 16px;
        border-top: 3px solid $darkblue;
        content: "";
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
      background: #f1a3a3;
      color: #000;
    }
  }
}
</style>
