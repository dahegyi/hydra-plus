<template>
  <div class="modal-container">
    <div class="modal">
      <div class="header">
        <h2>synth settings</h2>
        <span class="close" @click="close" />
      </div>

      <div class="tab-select">
        <button :class="{ active: activeTab === 0 }" @click="activeTab = 0">
          synth settings
        </button>

        <button :class="{ active: activeTab === 1 }" @click="activeTab = 1">
          philips hue settings
        </button>
      </div>

      <div v-if="activeTab === 0" class="tab-content">
        <div class="row">
          <label>speed</label>
          <input v-model="synthSettings.speed" type="number" />
        </div>

        <div class="row">
          <label>bpm</label>
          <input v-model="synthSettings.bpm" type="number" />
        </div>

        <div class="row">
          <label>output</label>
          <select v-model="synthSettings.output">
            <option value="">select output</option>
            <option
              v-for="(block, index) in blocks"
              :key="index"
              :value="index"
            >
              o{{ index }} - {{ block.name }}
            </option>
          </select>
        </div>

        <div class="row">
          <label>resolution</label>
          <input
            v-model="synthSettings.resolution"
            type="range"
            min="1"
            max="100"
            class="slider"
          />
        </div>

        <div class="row">
          <label>fps</label>
          <input v-model="synthSettings.fps" type="number" />
        </div>

        <a href="#" @click="openVisualizer">open visualizer</a>

        <button @click="setSynthSettings(synthSettings)">save</button>
      </div>

      <div v-else-if="activeTab === 1" class="tab-content">
        <div v-if="arePhilipsHueSettingsAvailabe">
          <p>philips hue settings - experimental</p>

          <!-- @todo connection settings -->

          <div class="row">
            <label>red</label>
            <input
              v-model="red"
              type="number"
              @focusout="updateRGB({ red, green, blue })"
            />
          </div>

          <div class="row">
            <label>green</label>
            <input
              v-model="green"
              type="number"
              @focusout="updateRGB({ red, green, blue })"
            />
          </div>

          <div class="row">
            <label>blue</label>
            <input
              v-model="blue"
              type="number"
              @focusout="updateRGB({ red, green, blue })"
            />
          </div>
        </div>
        <div v-else>
          <p>not available in production</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapActions } from "vuex";

export default {
  emits: ["close"],

  data() {
    return {
      activeTab: 0,
      red: "1",
      green: "1",
      blue: "1",
    };
  },

  computed: {
    ...mapGetters(["blocks", "synthSettings"]),

    arePhilipsHueSettingsAvailabe() {
      return process.env.NODE_ENV !== "production";
    },
  },

  methods: {
    ...mapActions(["setSynthSettings", "updateRGB"]),

    close() {
      this.$emit("close");
    },

    openVisualizer() {
      window.open("/visualizer", "_blank");

      this.close();
    },
  },
};
</script>

<style lang="scss" scoped>
.tab-select {
  display: flex;
  width: 100%;
  align-items: start;

  button {
    padding: 0.75rem 1rem;
    border: none;
    margin-bottom: -2px;
    background: none;

    &.active {
      background: #333;
    }
  }
}

.tab-content {
  display: flex;
  overflow: scroll;
  width: 100%;
  min-height: 120px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem 0.5rem;
  border-radius: 0 0 8px 8px;
  background: #333;

  a {
    margin-bottom: 1rem;
    color: #fff;
    text-align: center;

    &:hover {
      color: #fff;
    }
  }

  button {
    display: block;
    width: 120px;
    border: 2px solid #fff;
    margin: 10px auto 0;
  }
}
.row {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;

  label {
    margin-right: 1rem;
  }

  input,
  select {
    padding: 8px;
    border: 1px solid #00000040;
    border-radius: 0;
    background: #000000aa;
  }

  input,
  select {
    width: 200px;
  }
}
</style>
