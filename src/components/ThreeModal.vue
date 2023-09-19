<template>
  <div class="modal">
    <h2>3D settings</h2>

    <div class="row">soon...</div>

    <div>
      <button @click="saveAndClose">save and close</button>
    </div>
  </div>
</template>
<script>
import { mapGetters } from "vuex";

export default {
  name: "ThreeModal",

  emits: ["close", "saveAndClose"],

  computed: mapGetters(["blocks", "synthSettings"]),

  methods: {
    openVisualizer() {
      window.open("/visualizer", "_blank");

      this.$emit("close");
    },

    saveAndClose() {
      this.$emit("saveAndClose");
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
