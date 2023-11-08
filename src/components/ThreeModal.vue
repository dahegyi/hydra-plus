<template>
  <div class="modal-container">
    <div class="modal">
      <h2>3D settings</h2>

      <span class="close" @click="close" />

      <div class="row">soon...</div>

      <div>
        <button @click="close">close</button>
      </div>
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

<style lang="scss" scoped>
.modal {
  justify-content: space-between;
}

.row {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
