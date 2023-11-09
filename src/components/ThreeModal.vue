<template>
  <div class="modal-container">
    <div class="modal">
      <div class="header">
        <h2>3D settings</h2>
        <span class="close" @click="close" />
      </div>

      <div class="content">soon...</div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from "vuex";

export default {
  emits: ["close"],

  computed: mapGetters(["blocks", "synthSettings"]),

  methods: {
    close() {
      this.$emit("close");
    },
  },
};
</script>
