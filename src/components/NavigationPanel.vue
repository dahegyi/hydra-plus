<template>
  <div class="navigation">
    <div>
      <div class="dropdown">
        <button @click="openAddBlockModal">new source</button>
      </div>
    </div>

    <div>
      <button @click="openThreeModal">3D settings</button>
      <button class="settings" @click="openSettingsModal">
        synth settings
      </button>
      <button class="send" @click="send">send</button>
    </div>
  </div>
</template>
<script>
import { mapActions } from "vuex";

export default {
  emits: ["openAddBlockModal", "openThreeModal", "openSettingsModal"],

  methods: {
    ...mapActions(["send"]),

    openAddBlockModal() {
      this.$emit("openAddBlockModal");
    },

    openThreeModal() {
      this.$emit("openThreeModal");
    },

    openSettingsModal() {
      this.$emit("openSettingsModal");
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~/assets/styles/variables";

.navigation {
  position: fixed;
  z-index: 1;
  display: flex;
  width: 100%;
  justify-content: space-between;
  padding: 6px;
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  background: #151515dd;

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

  button {
    &.settings {
      margin-right: 2rem;
    }

    &.send {
      border: 3px solid $color-red;
    }
  }
}
</style>
