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
      <button class="send" @click="handleSend">send</button>
    </div>
  </div>
</template>
<script>
import { mapActions } from "vuex";

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

export default {
  emits: ["openAddBlockModal", "openThreeModal", "openSettingsModal"],

  data() {
    return {
      waitingForBeat: false,
    };
  },

  methods: {
    ...mapActions(["send"]),

    handleSend() {
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

      this.send();
    },

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
