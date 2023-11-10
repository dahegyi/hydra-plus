<script setup>
import { computed, defineProps, defineEmits } from "vue";
import { useStore } from "vuex";

import { createDispatchAction } from "~/utils/vuex-utils";

import {
  TYPE_SRC,
  TYPE_SIMPLE,
  TYPE_COMPLEX,
  SOURCE_FUNCTIONS,
  GEOMETRY_FUNCTIONS,
  COLOR_FUNCTIONS,
  BLEND_FUNCTIONS,
  MODULATE_FUNCTIONS,
} from "~/constants";

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

const header = computed(() =>
  isAddSource.value ? "add source" : "add effect",
);

const functionsBlocks = computed(() => {
  if (isAddSource.value) {
    return sources.value;
  }

  return effectGroups.value;
});

const emit = defineEmits(["close"]);

const close = () => {
  emit("close");
};

const store = useStore();
const dispatchAction = createDispatchAction(store);
const addParent = dispatchAction("addParent");
const addChild = dispatchAction("addChild");

const handleAddBlock = (parentType, fn) => {
  if (!props.parent) {
    addParent(fn);
  } else {
    if (parentType !== props.parent.type) {
      return;
    }

    addChild(fn);
  }

  close();
};
</script>

<template>
  <div class="modal-container">
    <div class="modal">
      <div class="header">
        <h2>{{ header }}</h2>
        <div>
          <h5>enable help</h5>
          <label class="switch">
            <input type="checkbox" />
            <span class="slider" />
          </label>
          <span class="close" @click="close" />
        </div>
      </div>

      <div class="content">
        <div
          v-for="functionBlock in functionsBlocks"
          :key="functionBlock.name"
          :class="isAddSource ? 'item' : 'group'"
        >
          <span
            :class="{ name: isAddSource }"
            @click="handleAddBlock(TYPE_COMPLEX, functionBlock)"
          >
            {{ functionBlock.name }}
          </span>

          <div
            v-for="fn in functionBlock.fns"
            :key="fn.name"
            class="item"
            @click="handleAddBlock(TYPE_SRC, fn)"
          >
            <span class="name">{{ fn.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modal {
  width: 600px;

  .header {
    div {
      display: flex;
      align-items: center;

      * {
        margin: 0 3px;
      }
    }

    .switch {
      position: relative;
      display: flex;
      width: 40px;
      height: 20px;

      input {
        opacity: 0;
      }

      .slider {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        border-radius: 10px;
        background-color: #999;
        cursor: pointer;
        transition: 0.2s;

        &:before {
          position: absolute;
          bottom: 4px;
          left: 4px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: white;
          content: "";
          transition: 0.2s;
        }
      }

      input:checked + .slider {
        background-color: #a75dcf;
      }

      input:focus + .slider {
        box-shadow: 0 0 1px #000;
      }

      input:checked + .slider:before {
        transform: translateX(14px);
      }
    }
  }

  .group {
    display: grid;
    width: 100%;
    grid-template-columns: repeat(3, 1fr);

    > span {
      margin-bottom: 2rem;
      font-weight: bold;
      grid-column: 1 / -1;
    }
  }

  .item {
    min-width: 50%;
    padding: 10px;
    border-radius: 4px;
    margin: 0 10px 20px;
    background: #151515;
    cursor: pointer;

    &:hover {
      background: #151515dd;
    }

    .name {
      font-size: 1rem;
      font-weight: bold;
    }
  }
}
</style>
