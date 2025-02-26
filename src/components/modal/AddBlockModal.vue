<script setup>
import { computed } from "vue";
import { useHydraStore } from "@/stores/hydra";

import {
  TYPE_SRC,
  TYPE_EXTERNAL,
  TYPE_THREE,
  TYPE_SIMPLE,
  TYPE_COMPLEX,
  SOURCE_FUNCTIONS,
  EXTERNAL_SOURCE_FUNCTIONS,
  THREE_FUNCTIONS,
  GEOMETRY_FUNCTIONS,
  COLOR_FUNCTIONS,
  BLEND_FUNCTIONS,
  MODULATE_FUNCTIONS,
} from "@/constants";
import BaseModal from "./BaseModal";

const store = useHydraStore();

const props = defineProps({
  parent: {
    type: Object,
    default: null,
  },
});

const sources = computed(() =>
  SOURCE_FUNCTIONS.map((fn) => ({
    ...fn,
    type: TYPE_SRC,
    blocks: [],
  })),
);

const externalSources = computed(() =>
  EXTERNAL_SOURCE_FUNCTIONS.map((fn) => ({
    ...fn,
    type: TYPE_EXTERNAL,
  })),
);

const threeSources = computed(() =>
  THREE_FUNCTIONS.map((fn) => ({ ...fn, type: TYPE_THREE })),
);

const effectGroups = computed(() => [
  {
    name: "geometry",
    fns: GEOMETRY_FUNCTIONS.map((fn) => ({ ...fn, type: TYPE_SIMPLE })),
  },
  {
    name: "color",
    fns: COLOR_FUNCTIONS.map((fn) => ({ ...fn, type: TYPE_SIMPLE })),
  },
  {
    name: "blend",
    fns: BLEND_FUNCTIONS.map((fn) => ({ ...fn, type: TYPE_COMPLEX })),
  },
  {
    name: "modulate",
    fns: MODULATE_FUNCTIONS.map((fn) => ({ ...fn, type: TYPE_COMPLEX })),
  },
]);

const isAddSource = computed(() => props.parent?.type !== TYPE_SRC);

const modalName = computed(() =>
  isAddSource.value ? "AddSourceModal" : "AddEffectModal",
);

const functionsBlocks = computed(() => {
  if (isAddSource.value) {
    if (!props.parent)
      return [
        ...sources.value,
        ...externalSources.value,
        ...threeSources.value,
      ];

    return sources.value;
  }

  return effectGroups.value;
});

const emit = defineEmits(["close"]);

const close = () => {
  emit("close");
};

const handleAddBlock = (parentType, fn) => {
  if (props.parent === null) {
    store.addParent(fn);
  } else {
    if (parentType !== props.parent.type) {
      return;
    }

    store.setFocus(props.parent);
    store.addChild(fn);
  }

  close();
};
</script>

<template>
  <BaseModal :modal-name="modalName" @close="close">
    <div
      v-for="functionBlock in functionsBlocks"
      :key="functionBlock.name"
      :class="isAddSource ? 'item' : 'group'"
      @click="handleAddBlock(TYPE_COMPLEX, functionBlock)"
    >
      <span class="name">
        {{ functionBlock.name }}
      </span>

      <div v-for="fn in functionBlock.fns" :id="fn.name" :key="fn.name">
        <div class="item" @click="handleAddBlock(TYPE_SRC, fn)">
          {{ fn.name }}
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/variables" as *;

.item {
  $unit: 8px;

  display: flex;
  min-width: 50%;
  align-items: center;
  justify-content: center;
  padding: $unit;
  border-radius: $border-radius-xs;
  margin: 0 $unit $unit * 2;
  background: #151515;
  cursor: pointer;

  &:hover {
    background: #111;
  }
}

.group {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(3, 1fr);

  @media screen and (max-width: 650px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media screen and (max-width: 450px) {
    grid-template-columns: repeat(1, 1fr);
  }

  > span {
    margin-bottom: 2rem;
    font-weight: bold;
    grid-column: 1 / -1;
  }
}
</style>
