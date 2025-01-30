<template>
  <welcome-modal v-if="isWelcomeModalOpen" @close="closeWelcomeModal" />

  <add-block-modal
    v-if="isAddBlockModalOpen"
    :parent="addBlockModalParent"
    @close="closeAddBlockModal"
  />

  <three-modal
    v-if="isThreeModalOpen"
    :blocks="externalSourceBlocks"
    @close="closeThreeModal"
  />

  <settings-modal v-if="isSettingsModalOpen" @close="closeSettingsModal" />

  <div class="playground" @click="() => focused && setFocus(null)" />

  <navigation-panel
    :class="{ hidden: areBlocksHidden }"
    @open-add-block-modal="openAddBlockModal"
    @open-three-modal="openThreeModal"
    @open-settings-modal="openSettingsModal"
  />

  <div :class="{ hidden: areBlocksHidden }">
    <parent-block
      v-for="(block, index) in blocks"
      :key="index"
      :index="index"
      :block="block"
      :handle-change="handleChange"
      :move-block="moveBlock"
      :open-add-block-modal="openAddBlockModal"
    />

    <parent-block
      v-for="(block, index) in externalSourceBlocks"
      :key="index"
      :index="index"
      :block="block"
      :handle-change="handleChange"
      :move-block="moveBlock"
    />
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useHydraStore } from "@/stores/hydra";

import { deepCopy } from "@/utils/object-utils";

import { WELCOME_MODAL_LAST_UPDATE, INITIAL_BLOCKS } from "@/constants";

import NavigationPanel from "@/components/NavigationPanel";
import ParentBlock from "../components/ParentBlock";

const store = useHydraStore();

export default {
  components: {
    WelcomeModal: defineAsyncComponent(
      () => import("@/components/WelcomeModal"),
    ),
    AddBlockModal: defineAsyncComponent(
      () => import("@/components/AddBlockModal"),
    ),
    ThreeModal: defineAsyncComponent(() => import("@/components/ThreeModal")),
    SettingsModal: defineAsyncComponent(
      () => import("@/components/SettingsModal"),
    ),
    NavigationPanel,
    ParentBlock,
  },

  data() {
    return {
      prevBlocks: null,
      movedBlockCoordinates: { x: 0, y: 0 },
      areBlocksHidden: false,
      addBlockModalParent: null,
      isWelcomeModalOpen: false,
      isAddBlockModalOpen: false,
      isThreeModalOpen: false,
      isSettingsModalOpen: false,
    };
  },

  computed: {
    focused() {
      return store.focused;
    },
    isInputFocused() {
      return store.isInputFocused;
    },
    blocks() {
      return store.blocks;
    },
    externalSourceBlocks() {
      return store.externalSourceBlocks;
    },
    synthSettings() {
      return store.synthSettings;
    },
  },

  mounted() {
    // show welcome modal
    if (
      !localStorage.getItem("welcomeModalLastUpdate") ||
      localStorage.getItem("welcomeModalLastUpdate") < WELCOME_MODAL_LAST_UPDATE
    ) {
      this.isWelcomeModalOpen = true;
    }

    // load stuff from local storage
    // @todo extract this mess from here
    // the localStorage conditions can be deleted after some time
    const blocks = [];
    const { saved } = store;

    if (saved.blocks) {
      blocks.push(...saved.blocks);
    } else if (localStorage.getItem("blocks")) {
      blocks.push(...JSON.parse(localStorage.getItem("blocks")));
    } else {
      blocks.push(...INITIAL_BLOCKS);
    }

    if (saved.externalSourceBlocks) {
      blocks.push(...saved.externalSourceBlocks);
    } else if (localStorage.getItem("externalSourceBlocks")) {
      blocks.push(...JSON.parse(localStorage.getItem("externalSourceBlocks")));
    }

    if (saved.synthSettings) {
      this.setSynthSettings(saved.synthSettings);
    } else if (localStorage.getItem("synthSettings")) {
      this.setSynthSettings(JSON.parse(localStorage.getItem("synthSettings")));
    } else {
      eval(
        `setResolution(${window.outerHeight * window.devicePixelRatio}, ${
          window.outerWidth * window.devicePixelRatio
        })`,
      );
    }

    this.setBlocks({ blocks });

    this.prevBlocks = [
      ...deepCopy(store.blocks),
      ...deepCopy(store.externalSourceBlocks),
    ];

    // set up keyboard shortcuts
    const onKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (!this.isInputFocused) {
          // undo
          if (e.keyCode === 90 && !e.shiftKey) {
            e.preventDefault();
            return store.undoRedo(1);
          }

          // redo
          if (e.keyCode === 89 || (e.keyCode === 90 && e.shiftKey)) {
            e.preventDefault();
            return store.undoRedo(-1);
          }
        }
      }

      // toggle blocks
      if (e.key === "Escape") {
        if (this.isAddBlockModalOpen) return this.closeAddBlockModal();
        if (this.isSettingsModalOpen) return this.closeSettingsModal();
        if (this.isThreeModalOpen) return this.closeThreeModal();
        return (this.areBlocksHidden = !this.areBlocksHidden);
      }

      if (this.isInputFocused && e.key === "Enter") {
        return this.handleChange(true);
      }
    };

    document.onkeydown = onKeyDown;
  },

  updated() {
    this.moveAllBlocks();
  },

  methods: {
    setFocus(payload) {
      store.setFocus(payload);
    },
    setInputFocus(payload) {
      store.setInputFocus(payload);
    },
    setBlocks(payload) {
      store.setBlocks(payload);
    },
    setBlockPosition(payload) {
      store.setBlockPosition(payload);
    },
    setSynthSettings(payload) {
      store.setSynthSettings(payload);
    },

    moveAllBlocks() {
      // move source blocks to their position
      // @todo: this is a bit confusing, could simplify
      store.blocks.forEach((block, index) => {
        this.moveBlock(block, index, block.type, block.position);
      });
      store.externalSourceBlocks.forEach((block, index) => {
        this.moveBlock(block, index, block.type, block.position);
      });
    },

    handleChange(isEnterKey = false) {
      if (!isEnterKey) store.setInputFocus(false);
      const newBlocks = [...store.blocks, ...store.externalSourceBlocks];
      if (JSON.stringify(newBlocks) === JSON.stringify(this.prevBlocks)) return;
      store.setBlocks({ blocks: newBlocks });
      this.prevBlocks = deepCopy(newBlocks);
    },

    moveBlock(e, index, type, position) {
      let div;
      let positionChanged = false;

      div = document.getElementById(`${type}-block-${index}`);

      if (position) {
        return (div.style.transform = `translate(${position.x}px, ${position.y}px)`);
      }

      if (e.type === "touchstart") {
        e.preventDefault();
        e = e.touches[0];
      }

      const divRect = div.getBoundingClientRect();

      const offsetX = e.clientX - divRect.left - window.scrollX;
      const offsetY = e.clientY - divRect.top - window.scrollY;

      const x = e.clientX - offsetX;
      const y = e.clientY - offsetY;

      this.movedBlockCoordinates = { x, y };

      const move = (e) => {
        if (e.type === "touchmove") {
          e.preventDefault();
          e = e.touches[0];
        }

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

        document.removeEventListener("touchmove", move);
        document.removeEventListener("touchend", up);
        if (positionChanged) {
          store.setBlockPosition({
            index,
            type,
            position: this.movedBlockCoordinates,
          });
        }
      };

      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);

      document.addEventListener("touchmove", move);
      document.addEventListener("touchend", up);
    },

    // @todo: better modal opening/closing logic

    runModalCloseAnimation() {
      const container = document.getElementsByClassName("modal-container")[0];
      const modal = container.getElementsByClassName("modal")[0];

      container.classList.add("closing");
      modal.classList.add("closing");
    },

    closeWelcomeModal() {
      this.runModalCloseAnimation();

      setTimeout(() => {
        this.isWelcomeModalOpen = false;
        localStorage.setItem(
          "welcomeModalLastUpdate",
          WELCOME_MODAL_LAST_UPDATE,
        );
      }, 150);
    },

    openAddBlockModal(parent = null) {
      this.addBlockModalParent = parent;
      this.isAddBlockModalOpen = true;
    },

    closeAddBlockModal() {
      this.runModalCloseAnimation();

      setTimeout(() => {
        this.isAddBlockModalOpen = false;
      }, 150);
    },

    openThreeModal() {
      this.isThreeModalOpen = true;
    },

    closeThreeModal() {
      this.runModalCloseAnimation();

      setTimeout(() => {
        this.isThreeModalOpen = false;
      }, 150);
    },

    openSettingsModal() {
      this.isSettingsModalOpen = true;
    },

    closeSettingsModal() {
      this.runModalCloseAnimation();

      setTimeout(() => {
        this.isSettingsModalOpen = false;
      }, 150);
    },
  },
};
</script>

<style lang="scss" scoped>
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
</style>
