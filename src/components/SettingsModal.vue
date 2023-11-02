<template>
  <div class="modal">
    <h2>synth settings</h2>

    <span class="close" @click="close" />

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
        <option v-for="(block, index) in blocks" :key="index" :value="index">
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

    <div>
      <button @click="setSynthSettings(synthSettings)">save</button>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapActions } from "vuex";

export default {
  emits: ["close"],

  computed: mapGetters(["blocks", "synthSettings"]),

  methods: {
    ...mapActions(["setSynthSettings"]),

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
.row {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
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
