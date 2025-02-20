<script setup>
import { defineAsyncComponent, onMounted, onUpdated, ref, computed } from "vue";
import { useHydraStore } from "@/stores/hydra";

import { getSafeLocalStorage, setSafeLocalStorage } from "@/utils";
import { deepCopy } from "@/utils/object-utils";

import { CURRENT_VERSION, INITIAL_BLOCKS } from "@/constants";

import NavigationPanel from "@/components/NavigationPanel";
import ParentBlock from "@/components/ParentBlock";

import Toaster from "@/components/ui/toast/Toaster";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  // ContextMenuSub,
  // ContextMenuSubContent,
  // ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

const store = useHydraStore();

const WelcomeModal = defineAsyncComponent(() =>
  import("@/components/modal/WelcomeModal"),
);
const AddBlockModal = defineAsyncComponent(() =>
  import("@/components/modal/AddBlockModal"),
);
const ThreeModal = defineAsyncComponent(() =>
  import("@/components/modal/ThreeModal"),
);
const SettingsModal = defineAsyncComponent(() =>
  import("@/components/modal/SettingsModal"),
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

// set up keyboard shortcuts
const onKeyDown = (e) => {
  if (e.ctrlKey || e.metaKey) {
    if (!store.isInputFocused) {
      const isUndo = e.keyCode === 90 && !e.shiftKey;
      const isRedo = e.keyCode === 89 || (e.keyCode === 90 && e.shiftKey);
      const isCopy = e.keyCode === 67;
      const isCut = e.keyCode === 88;
      const isPaste = e.keyCode === 86;

      if (isUndo || isRedo || isCopy || isCut || isPaste) {
        e.preventDefault();
      }

      if (isUndo) return store.undoRedo(1);
      if (isRedo) return store.undoRedo(-1);
      if (isCopy) return store.copyBlock(false);
      if (isCut) return store.copyBlock(true);
      if (isPaste) return store.pasteBlock();
    }
  }

  if (e.key === "Escape" && !isAnyModalOpen.value) {
    return toggleFullscreen();
  }

  if (e.key === "Enter" && store.isInputFocused) {
    return handleChange(true);
  }
};

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

  document.addEventListener("keydown", onKeyDown);
});

onUpdated(() => {
  moveAllBlocks();
});

const toggleFullscreen = () => (areBlocksHidden.value = !areBlocksHidden.value);

const moveAllBlocks = () => {
  // move source blocks to their positions
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

    let x = e.clientX - offsetX;
    let y = e.clientY - offsetY;

    if (x <= 0) x = 0;
    if (y <= 48) y = 48;

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

const canPasteOnPlayground = computed(() => store.copied?.type === "source");

const pasteOnPlayground = () => {
  store.setFocus(null);
  store.pasteBlock();
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

  <ContextMenu>
    <ContextMenuTrigger @click="store.setFocus(null)">
      <div class="playground" @click="store.setFocus(null)" />
    </ContextMenuTrigger>
    <ContextMenuContent>
      <ContextMenuItem @click="openAddBlockModal()">New source</ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuCheckboxItem
        :checked="areBlocksHidden"
        @click="toggleFullscreen"
      >
        Hide UI
        <ContextMenuShortcut>Esc</ContextMenuShortcut>
      </ContextMenuCheckboxItem>
      <ContextMenuSeparator v-if="canPasteOnPlayground" />
      <ContextMenuItem v-if="canPasteOnPlayground" @click="pasteOnPlayground">
        Paste
      </ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>

  <navigation-panel
    v-show="!areBlocksHidden"
    @open-add-block-modal="openAddBlockModal"
    @open-three-modal="openThreeModal"
    @open-settings-modal="openSettingsModal"
    @toggle-fullscreen="toggleFullscreen"
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

  <Toaster />
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
