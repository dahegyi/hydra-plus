<script setup>
import { computed } from "vue";
import { useHydraStore } from "@/stores/hydra";
import { MODIFIER_KEY } from "@/constants";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  // MenubarSub,
  // MenubarSubContent,
  // MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Button } from "@/components/ui/button";

import { useToast } from "@/components/ui/toast/use-toast";
const { toast } = useToast();

// // @todo: losing window focus breaks the beat counter
// let beatHappened = false;
// let beatCounter = 0;
// let lastBeatTime = 1; // so that the first beat is always logged
// const beatLogInterval = 4;

// // eslint-disable-next-line no-undef
// update = () => {
//   const { bpm, fps, time } = window.hydra;
//   const beatInterval = 60 / bpm;
//   const frameInterval = 1 / fps;
//   const timeSinceLastBeat = time % beatInterval;

//   if (timeSinceLastBeat < lastBeatTime && !beatHappened) {
//     beatHappened = true;
//     beatCounter += 1;

//     if (beatCounter === beatLogInterval) {
//       beatCounter = 0;
//       // console.warn("beat");
//     }
//   }

//   lastBeatTime = timeSinceLastBeat;

//   if (timeSinceLastBeat > frameInterval) {
//     beatHappened = false;
//   }
// };

const store = useHydraStore();

const emit = defineEmits([
  "openAddBlockModal",
  "openThreeModal",
  "openSettingsModal",
  "toggleFullscreen",
]);

// const waitingForBeat = ref(false);

const handleSend = () => {
  // if (!this.waitingForBeat) {
  //   this.waitingForBeat = true;
  //   const checkInterval = setInterval(() => {
  //     if (beatCounter === 0) {
  //       clearInterval(checkInterval);
  //       this.waitingForBeat = false;
  //       this.send();
  //     }
  //   }, 10);
  // }

  store.send();
};

const openAddBlockModal = () => {
  emit("openAddBlockModal");
};

const isAddEffectModalDisabled = computed(() => {
  const { focused } = store;
  return (
    !focused ||
    (focused.type === "complex" && focused.blocks.length > 0) ||
    focused.type === "external"
  );
});

const openAddEffectModal = () => {
  emit("openAddBlockModal", store.focused);
};

// const openThreeModal = () => {
//   emit("openThreeModal");
// };

const openVisualizerPage = () => {
  window.open("/visualizer", "_blank");
};

const openSettingsModal = () => {
  emit("openSettingsModal");
};

const goFullscreen = () => {
  emit("toggleFullscreen");

  toast({
    title: "Entered fullscreen mode",
    description: "Press Esc to exit",
  });
};
</script>

<template>
  <div class="navigation">
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>New</MenubarTrigger>
        <MenubarContent>
          <MenubarItem @click="openAddBlockModal"> Source </MenubarItem>
          <MenubarItem
            :disabled="isAddEffectModalDisabled"
            @click="openAddEffectModal"
          >
            Effect
          </MenubarItem>
          <!-- <MenubarSeparator />
        <MenubarItem disabled> Scene </MenubarItem> -->
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem :disabled="!store.canUndo" @click="store.undoRedo(1)">
            Undo
            <MenubarShortcut>{{ MODIFIER_KEY }}+Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem :disabled="!store.canRedo" @click="store.undoRedo(-1)">
            Redo
            <MenubarShortcut>{{ MODIFIER_KEY }}+Y</MenubarShortcut>
          </MenubarItem>

          <MenubarSeparator />

          <MenubarItem
            :disabled="!store.focused"
            @click="store.copyBlock(true)"
          >
            Cut
            <MenubarShortcut>{{ MODIFIER_KEY }}+X</MenubarShortcut>
          </MenubarItem>
          <MenubarItem
            :disabled="!store.focused"
            @click="store.copyBlock(false)"
          >
            Copy
            <MenubarShortcut>{{ MODIFIER_KEY }}+C</MenubarShortcut>
          </MenubarItem>
          <MenubarItem :disabled="!store.canPaste" @click="store.pasteBlock">
            Paste
            <MenubarShortcut> {{ MODIFIER_KEY }}+V </MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarItem @click="openVisualizerPage">Visualizer</MenubarItem>
          <MenubarItem @click="openSettingsModal"> Settings </MenubarItem>
          <MenubarSeparator />
          <MenubarItem @click="goFullscreen">
            Toggle Fullscreen
            <MenubarShortcut> Esc </MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>

    <Button
      variant="outline"
      class="flex ml-auto border-red-600 bg-transparent"
      @click="handleSend"
    >
      Send
    </Button>
  </div>
</template>

<style lang="scss" scoped>
.navigation {
  position: fixed;
  z-index: 100;
  display: flex;
  width: 100%;
  padding: 6px;
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  background: #151515dd;

  div[role="menubar"] {
    border: none;
    border-radius: 0;
    background: none;
  }
}
</style>
