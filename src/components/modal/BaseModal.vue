<script setup>
import { computed } from "vue";

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
</script>

<template>
  <div class="modal-container">
    <div :class="['modal', customClass]">
      <div v-if="title" class="header">
        <h2>{{ title }}</h2>
        <span class="close" @click="close" />
      </div>

      <div class="content">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/styles/variables" as *;

.modal-container {
  position: fixed;
  z-index: 998;
  top: 0;
  left: 0;
  display: flex;
  width: 100vw;
  height: 100vh;
  align-items: center;
  justify-content: center;
  padding: 15px;
  animation: opacity-in 0.1s ease-in-out;
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  background: rgba(0, 0, 0, 0.3);

  .modal {
    z-index: 999;
    display: flex;
    width: 460px;
    max-width: 100%;
    min-height: 200px;
    max-height: min(100%, 800px);
    flex-direction: column;
    align-items: center;
    border-radius: $border-radius 0;
    animation:
      slide-in 0.15s ease-in-out,
      opacity-in 0.15s ease-in-out;
    background: #222;
    box-shadow: 0 3px 20px 10px rgba(0, 0, 0, 0.5);
    overflow-y: auto;

    &.welcome {
      width: 520px;
    }

    &.add-block {
      width: 680px;
    }

    &.settings {
      .content {
        padding: 0;
      }
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

      h2 {
        margin: 0;
        font-size: 1rem;
      }

      .close {
        padding: 10px;
        margin: 0 0 0 12px;
        background: #111;
        cursor: pointer;
        font-size: 1.8rem;

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

    &.closing {
      animation:
        slide-out 0.15s ease-in-out,
        opacity-out 0.15s ease-in-out;
    }
  }

  &.closing {
    animation: opacity-out 0.15s ease-in-out;
  }

  @media screen and (max-width: 500px) {
    padding: 0;

    .modal {
      border-radius: 0;
    }
  }
}

@keyframes opacity-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes opacity-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes slide-in {
  from {
    transform: translateY(20px);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes slide-out {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(20px);
  }
}
</style>
