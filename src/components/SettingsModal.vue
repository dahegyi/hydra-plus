<template>
  <div class="modal">
    <h2>settings</h2>

    <div class="row">
      <label>speed</label>
      <input type="number" v-model="synthSettings.speed" />
    </div>

    <div class="row">
      <label>bpm</label>
      <input type="number" v-model="synthSettings.bpm" />
    </div>

    <div class="row">
      <label>output</label>
      <select v-model="synthSettings.output">
        <option value="">select output</option>
        <option v-for="(block, index) in blocks" :value="index">
          o{{ index }} - {{ block.name }}
        </option>
      </select>
    </div>

    <div class="row">
      <label>resolution</label>
      <input
        type="range"
        min="1"
        max="100"
        class="slider"
        v-model="synthSettings.resolution"
      />
    </div>

    <div class="row">
      <label>fps</label>
      <input type="number" v-model="synthSettings.fps" />
    </div>

    <a href="#" @click="openVisualizer">open visualizer</a>

    <div>
      <button @click="closeAndSave">save and close</button>
    </div>
  </div>
</template>
<script>
import { mapGetters } from "vuex";

export default {
  name: "SettingsModal",

  emits: ["close", "closeAndSave"],

  computed: mapGetters(["blocks", "synthSettings"]),

  methods: {
    openVisualizer() {
      window.open("/visualizer", "_blank");

      this.$emit("close");
    },

    closeAndSave() {
      this.$emit("closeAndSave");
    },
  },
};
</script>

<style lang="scss" scoped>
h2 {
  margin-top: 0.5rem;
}

button {
  margin: 5px;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 1rem;

  label {
    margin-right: 1rem;
  }

  $width: 200px;

  input,
  select {
    padding: 8px;
    border: 1px solid #00000040;
    border-radius: 0;
    background: #000000aa;
  }

  input {
    width: $width;
  }

  select {
    width: calc($width + 18px);
  }
}
</style>
