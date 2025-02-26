<script setup>
import { computed, onMounted } from "vue";
import { CURRENT_VERSION } from "@/constants";
import { setSafeLocalStorage } from "@/utils";

import { Button } from "@/components/ui/button";

const emit = defineEmits(["close"]);

const props = defineProps({
  modalName: {
    required: true,
    type: String,
  },

  blocks: {
    type: Object,
    default: () => {},
  },
});

const close = () => {
  if (props.modalName === "WelcomeModal") {
    setSafeLocalStorage("welcomeModalLastUpdate", CURRENT_VERSION);
  }

  emit("close");
};

const title = computed(() => {
  const { modalName } = props;

  if (modalName === "WelcomeModal") return "";
  if (modalName === "SettingsModal") return "settings";
  if (modalName === "ThreeModal") return "3D settings";
  if (modalName === "AddSourceModal") return "add source";
  if (modalName === "AddEffectModal") return "add effect";
  return "Default Title";
});

const customClass = computed(() => {
  switch (props.modalName) {
    case "WelcomeModal":
      return "welcome";
    case "SettingsModal":
      return "settings";
    case "ThreeModal":
      return "three";
    case "AddSourceModal":
    case "AddEffectModal":
      return "add-block";
    default:
      return "";
  }
});

const closeOnEsc = (e) => {
  if (e.key === "Escape") close();
};

onMounted(() => {
  document.addEventListener("keydown", closeOnEsc);
});
</script>

<template>
  <div class="modal-container" @click="close">
    <div :class="['modal', customClass]" @click="(e) => e.stopPropagation()">
      <div v-if="title" class="header">
        <h2>{{ title }}</h2>
        <span class="close" @click="close" />
      </div>

      <div class="content">
        <slot />

        <Button v-if="modalName === 'WelcomeModal'" class="mt-8" @click="close">
          Let's go
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/styles/variables" as *;

.modal-container {
  position: fixed;
  z-index: 101;
  top: -20px;
  left: 0;
  display: flex;
  width: 100vw;
  height: calc(100vh + 20px);
  align-items: center;
  justify-content: center;
  padding: 15px;
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
  background: rgba(0, 0, 0, 0.3);

  .modal {
    z-index: 102;
    display: flex;
    width: 460px;
    max-width: 100%;
    min-height: 200px;
    max-height: min(100%, 800px);
    flex-direction: column;
    align-items: center;
    border-radius: $border-radius 0;
    background: #222;
    box-shadow: 0 3px 20px 10px rgba(0, 0, 0, 0.5);
    overflow-y: auto;

    &.welcome {
      width: 520px;

      .content {
        align-items: unset;
        text-align: left;
      }
    }

    &.add-block {
      width: 680px;
    }

    &::-webkit-scrollbar {
      display: none;
    }

    .header {
      display: flex;
      width: 100%;
      align-items: center;
      justify-content: space-between;
      padding-left: 16px;
      background: #00000040;
      font-weight: 600;

      h2 {
        margin: 0;
        font-size: 1rem;
      }

      .close {
        padding: 8px 12px;
        margin: 0 0 0 12px;
        background: #111;
        cursor: pointer;
        font-size: 1.4rem;

        &:before {
          color: $color-red;
          content: "×";
        }
      }
    }

    .content {
      position: relative;
      display: flex;
      width: 100%;
      flex-direction: column;
      align-items: center;
      padding: 20px 30px;
      overflow-y: auto;
      text-align: center;
    }
  }

  @media screen and (max-width: 500px) {
    padding: 0;

    .modal {
      border-radius: 0;
    }
  }
}
</style>
