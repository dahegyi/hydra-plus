<script setup>
import { useStore } from "vuex";
import { defineEmits } from "vue";

const store = useStore();
const emit = defineEmits(["close"]);

defineProps({
  blocks: {
    required: true,
    type: Object,
  },
});

const close = () => {
  emit("close");
};

const save = () => {
  console.log(store);
  // store.commit("setBlocks", blocks);
  // close();
};
</script>

<template>
  <div class="modal-container">
    <div class="modal">
      <div class="header">
        <h2>3D settings</h2>
        <span class="close" @click="close" />
      </div>

      <div class="content">
        <div v-if="blocks.length === 0">
          No 3D blocks in the scene
          <br />
          <button @click="close">Close</button>
        </div>

        <div v-else class="w-100">
          <div v-for="(block, index) in blocks" :key="block.id">
            <span v-if="block.type === 'three'">
              <label>s{{ index }}</label>
              <br />
              <textarea v-model="block.params.threeJsContent"></textarea>
            </span>
          </div>
          <button @click="close">Cancel</button>
          <button @click="save">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.w-100 {
  width: 100%;
}

textarea {
  width: 100%;
  height: 200px;
}
</style>
