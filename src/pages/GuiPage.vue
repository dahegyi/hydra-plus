<script setup>
import { defineAsyncComponent, onMounted, onUpdated, ref, computed } from "vue";
import { useHydraStore } from "@/stores/hydra";

import { getSafeLocalStorage, setSafeLocalStorage } from "@/utils";
import { deepCopy } from "@/utils/object-utils";

import { CURRENT_VERSION, INITIAL_BLOCKS } from "@/constants";

import NavigationPanel from "@/components/NavigationPanel";
import ParentBlock from "@/components/ParentBlock";

const store = useHydraStore();

const WelcomeModal = defineAsyncComponent(
  () => import("@/components/modal/WelcomeModal"),
);
const AddBlockModal = defineAsyncComponent(
  () => import("@/components/modal/AddBlockModal"),
);
const ThreeModal = defineAsyncComponent(
  () => import("@/components/modal/ThreeModal"),
);
const SettingsModal = defineAsyncComponent(
  () => import("@/components/modal/SettingsModal"),
);

const prevBlocks = ref(null);
const movedBlockCoordinates = ref({ x: 0, y: 0 });
const areBlocksHidden = ref(false);
const addBlockModalParent = ref(null);
const isWelcomeModalOpen = ref(false);
const isAddBlockModalOpen = ref(false);
const isThreeModalOpen = ref(false);
const isSettingsModalOpen = ref(false);

const isAnyModalOpen = computed(() => {
  return (
    isWelcomeModalOpen.value ||
    isAddBlockModalOpen.value ||
    isThreeModalOpen.value ||
    isSettingsModalOpen.value
  );
});

onMounted(() => {
  // show welcome modal
  if (
    !getSafeLocalStorage("welcomeModalLastUpdate") ||
    getSafeLocalStorage("welcomeModalLastUpdate") < CURRENT_VERSION
  ) {
    isWelcomeModalOpen.value = true;
  }

  // load stuff from local storage
  // @todo extract this mess from here
  const blocks = [];

  if (getSafeLocalStorage("blocks")) {
    blocks.push(...getSafeLocalStorage("blocks"));
  } else {
    blocks.push(...INITIAL_BLOCKS);
  }

  if (getSafeLocalStorage("externalSourceBlocks")) {
    blocks.push(...getSafeLocalStorage("externalSourceBlocks"));
  }

  if (getSafeLocalStorage("synthSettings")) {
    store.setSynthSettings(getSafeLocalStorage("synthSettings"));
  } else {
    eval(
      `setResolution(${window.outerHeight * window.devicePixelRatio}, ${
        window.outerWidth * window.devicePixelRatio
      })`,
    );
  }

  store.setBlocks({ blocks });

  prevBlocks.value = [
    ...deepCopy(store.blocks),
    ...deepCopy(store.externalSourceBlocks),
  ];

  // set up keyboard shortcuts
  const onKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (!store.isInputFocused) {
        const isUndo = e.keyCode === 90 && !e.shiftKey;
        const isRedo = e.keyCode === 89 || (e.keyCode === 90 && e.shiftKey);

        if (isUndo) {
          e.preventDefault();
          return store.undoRedo(1);
        }

        if (isRedo) {
          e.preventDefault();
          return store.undoRedo(-1);
        }
      }
    }

    // toggle blocks
    if (e.key === "Escape") {
      if (isAddBlockModalOpen.value) return closeAddBlockModal();
      if (isSettingsModalOpen.value) return closeSettingsModal();
      if (isThreeModalOpen.value) return closeThreeModal();
      return (areBlocksHidden.value = !areBlocksHidden.value);
    }

    if (store.isInputFocused && e.key === "Enter") {
      return handleChange(true);
    }
  };

  document.onkeydown = onKeyDown;
});

onUpdated(() => {
  moveAllBlocks();
});

const moveAllBlocks = () => {
  // move source blocks to their position
  // @todo: this is a bit confusing, could simplify
  store.blocks.forEach((block, index) => {
    moveBlock(null, index, block.type, block.position);
  });
  store.externalSourceBlocks.forEach((block, index) => {
    moveBlock(null, index, block.type, block.position);
  });
};

const moveBlock = (e, index, type, position) => {
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

  movedBlockCoordinates.value = { x, y };

  const move = (e) => {
    if (e.type === "touchmove") {
      e.preventDefault();
      e = e.touches[0];
    }

    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;

    movedBlockCoordinates.value = { x, y };
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
        position: movedBlockCoordinates.value,
      });
    }
  };

  document.addEventListener("mousemove", move);
  document.addEventListener("mouseup", up);

  document.addEventListener("touchmove", move);
  document.addEventListener("touchend", up);
};

const handleChange = (isEnterKey = false) => {
  if (!isEnterKey) store.setInputFocus(false);
  const newBlocks = [...store.blocks, ...store.externalSourceBlocks];
  if (JSON.stringify(newBlocks) === JSON.stringify(prevBlocks.value)) return;
  store.setBlocks({ blocks: newBlocks });
  prevBlocks.value = deepCopy(newBlocks);
};

const closeWelcomeModal = () => {
  isWelcomeModalOpen.value = false;
  setSafeLocalStorage("welcomeModalLastUpdate", CURRENT_VERSION);
};

const openAddBlockModal = (parent = null) => {
  addBlockModalParent.value = parent;
  isAddBlockModalOpen.value = true;
};

const closeAddBlockModal = () => {
  isAddBlockModalOpen.value = false;
};

const openThreeModal = () => {
  isThreeModalOpen.value = true;
};

const closeThreeModal = () => {
  isThreeModalOpen.value = false;
};

const openSettingsModal = () => {
  isSettingsModalOpen.value = true;
};

const closeSettingsModal = () => {
  isSettingsModalOpen.value = false;
};
</script>

<template>
  <transition name="modal">
    <div v-if="isAnyModalOpen">
      <welcome-modal v-if="isWelcomeModalOpen" @close="closeWelcomeModal" />
      <add-block-modal
        v-if="isAddBlockModalOpen"
        :parent="addBlockModalParent"
        @close="closeAddBlockModal"
      />
      <three-modal
        v-if="isThreeModalOpen"
        :blocks="store.externalSourceBlocks"
        @close="closeThreeModal"
      />
      <settings-modal v-if="isSettingsModalOpen" @close="closeSettingsModal" />
    </div>
  </transition>

  <div class="playground" @click="store.setFocus(null)" />

  <navigation-panel
    v-show="!areBlocksHidden"
    @open-add-block-modal="openAddBlockModal"
    @open-three-modal="openThreeModal"
    @open-settings-modal="openSettingsModal"
  />

  <div v-show="!areBlocksHidden">
    <parent-block
      v-for="(block, index) in store.blocks"
      :key="index"
      :index="index"
      :block="block"
      :handle-change="handleChange"
      :move-block="moveBlock"
      :open-add-block-modal="openAddBlockModal"
    />

    <parent-block
      v-for="(block, index) in store.externalSourceBlocks"
      :key="index"
      :index="index"
      :block="block"
      :handle-change="handleChange"
      :move-block="moveBlock"
    />
  </div>
</template>

<style lang="scss" scoped>
.playground {
  position: fixed;
  z-index: 0;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.15s;
}
.modal-enter,
.modal-leave-to {
  opacity: 0;
}
</style>
