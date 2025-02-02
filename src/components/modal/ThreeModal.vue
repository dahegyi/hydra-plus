<script setup>
import { useHydraStore } from "@/stores/hydra";
import BaseModal from "./BaseModal.vue";

const store = useHydraStore();

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
  // close();
};
</script>

<template>
  <BaseModal modal-name="ThreeModal" @close="close">
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
      <button @click="close">cancel</button>
      <button @click="save">save</button>
    </div>
  </BaseModal>
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
