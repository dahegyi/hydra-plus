<script setup>
import { computed, defineProps, defineEmits, ref } from "vue";
import { useStore } from "vuex";

import { stateToProps, createDispatchAction } from "~/utils/vuex-utils";

import { INFO_MAPPINGS } from "~/constants";

import { createPopper } from "@popperjs/core";

import Hydra from "hydra-synth";

import {
  TYPE_SRC,
  TYPE_EXTERNAL,
  TYPE_SIMPLE,
  TYPE_COMPLEX,
  SOURCE_FUNCTIONS,
  EXTERNAL_SOURCE_FUNCTIONS,
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

const externalSources = computed(() =>
  EXTERNAL_SOURCE_FUNCTIONS.map((fn) => ({
    ...fn,
    type: TYPE_EXTERNAL,
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
    if (!props.parent) return [...sources.value, ...externalSources.value];

    return sources.value;
  }

  return effectGroups.value;
});

const emit = defineEmits(["close"]);

const close = () => {
  emit("close");
};

const selectedFunction = ref(null);

const store = useStore();
const state = store.state;

const { activeBlockCode } = stateToProps(state, ["activeBlockCode"]);

const dispatchAction = createDispatchAction(store);
const addParent = dispatchAction("addParent");
const addChild = dispatchAction("addChild");

const handleMouseenter = (fn) => {
  if (selectedFunction.value === fn.name) {
    selectedFunction.value = null;
    return;
  }

  selectedFunction.value = fn.name;

  const effect = document.getElementById(fn.name).querySelector(".info");
  const tooltip = document.querySelector(`#${fn.name}-tooltip`);
  createPopper(effect, tooltip);

  if (tooltip.querySelector("canvas")) return;

  const canvas = document.createElement("canvas");
  tooltip.appendChild(canvas);

  // used in eval but eslint doesn't recognize it
  // eslint-disable-next-line no-unused-vars
  const hydra = new Hydra({
    height: 100,
    width: 100,
    numSources: 1,
    numOutputs: 1,
    makeGlobal: false,
    detectAudio: false,
    enableStreamCapture: false,
    canvas,
  }).synth;

  // @todo: the selected function is not always at the end of the chain
  eval(`hydra.${activeBlockCode.value}${INFO_MAPPINGS[fn.name].code}.out()`);
};

const handleAddBlock = (parentType, fn) => {
  if (props.parent === null) {
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
        <span class="close" @click="close" />
      </div>

      <div class="content">
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
            <div class="item">
              <span class="name" @click="handleAddBlock(TYPE_SRC, fn)">
                {{ fn.name }}
              </span>
              <span class="info" @click="handleMouseenter(fn)" />
            </div>

            <div
              v-show="selectedFunction === fn.name"
              :id="`${fn.name}-tooltip`"
              class="tooltip"
              role="tooltip"
            >
              <span>
                {{ INFO_MAPPINGS[fn.name].description }}
              </span>
              <div id="arrow" data-popper-arrow></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "~/assets/styles/variables";

.modal {
  width: 600px;

  .item {
    display: flex;
    min-width: 50%;
    align-items: center;

    justify-content: space-between;

    margin: 0 10px 20px;

    .name {
      width: 100%;
      padding: 10px;
      border-radius: $border-radius-xs;
      background: #151515;
      cursor: pointer;

      &:hover {
        background: #111;
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

    .item {
      .name {
        width: calc(100% - 30px);
        border-radius: $border-radius-xs 0 0 $border-radius-xs;
      }

      .info {
        width: 30px;
        padding: 10px 0;
        border-radius: 0 $border-radius-xs $border-radius-xs 0;
        background: #333;
        cursor: pointer;

        &:after {
          content: "i";
          font-weight: bold;
        }
      }
    }
  }
}

.tooltip {
  display: flex;
  flex-direction: column;
  padding: 5px 10px;
  border-radius: 4px;
  background: #ffffff;
  color: #643045;
  font-size: 13px;
  font-weight: bold;
}

#arrow,
#arrow::before {
  position: absolute;
  width: 8px;
  height: 8px;
  background: inherit;
}

#arrow {
  visibility: hidden;
}

#arrow::before {
  content: "";
  transform: rotate(45deg);
  visibility: visible;
}

.tooltip[data-popper-placement^="top"] > #arrow {
  bottom: -4px;
}

.tooltip[data-popper-placement^="bottom"] > #arrow {
  top: -4px;
}

.tooltip[data-popper-placement^="left"] > #arrow {
  right: -4px;
}

.tooltip[data-popper-placement^="right"] > #arrow {
  left: -4px;
}
</style>
