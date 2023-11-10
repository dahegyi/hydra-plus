<script setup>
import { useStore } from "vuex";
import { stateToProps, createDispatchAction } from "~/utils/vuex-utils";

import { TYPE_SRC } from "~/constants";

import NestedDraggable from "~/components/NestedDraggable";
import { computed } from "vue";

const props = defineProps({
  index: {
    type: Number,
    required: true,
  },

  block: {
    type: Object,
    required: true,
  },

  handleChange: {
    type: Function,
    required: true,
  },

  moveBlock: {
    type: Function,
    required: true,
  },

  openAddBlockModal: {
    type: Function,
    default: () => {},
  },
});

const store = useStore();
const state = store.state;

const { synthSettings, blocks, externalSourceBlocks, focused } = stateToProps(
  state,
  ["synthSettings", "blocks", "externalSourceBlocks", "focused"],
);

const blockHeader = computed(() => {
  return `${props.block.type === TYPE_SRC ? "o" : "s"}${props.index} - ${
    props.block.name
  }`;
});

const dispatchAction = createDispatchAction(store);
const setFocus = dispatchAction("setFocus");
const deleteParent = dispatchAction("deleteParent");
const setOutput = dispatchAction("setOutput");
const setInputFocus = dispatchAction("setInputFocus");

const handleHeaderClick = (clickedBlock) => {
  if (props.focused === clickedBlock) return;
  setFocus(clickedBlock);
};
</script>

<template>
  <div
    :id="`${props.block.type}-block-${props.index}`"
    :class="[
      'parent-block',
      props.block.type,
      { focused: focused === props.block },
    ]"
  >
    <div @click="handleHeaderClick(blocks[props.index])">
      <strong
        class="output-header"
        @mousedown="(e) => props.moveBlock(e, props.index, props.block.type)"
      >
        <span>{{ blockHeader }}</span>
        <div>
          <span
            v-if="props.block.type === TYPE_SRC"
            :class="[
              'activate',
              { active: synthSettings?.output === props.index },
            ]"
            @click="setOutput(index)"
          />
          <span
            class="delete"
            @click="
              deleteParent({ type: props.block.type, index: props.index })
            "
          />
        </div>
      </strong>

      <div
        v-for="(param, paramIndex) in props.block.params"
        :key="paramIndex"
        class="param-input-container"
      >
        <label>{{ param.name }}</label>

        <select
          v-if="param.name === 'src'"
          v-model="param.value"
          @change="() => props.handleChange()"
        >
          <option
            v-for="(source, sIndex) in externalSourceBlocks"
            :key="'s' + sIndex"
            :value="'s' + sIndex"
          >
            s{{ sIndex }} - {{ source.name }}
          </option>
          <option
            v-for="(output, oIndex) in blocks"
            :key="'o' + oIndex"
            :value="'o' + oIndex"
          >
            o{{ oIndex }} - {{ output.name }}
          </option>
        </select>

        <input
          v-else
          v-model="param.value"
          type="text"
          @focusin="setInputFocus(true)"
          @focusout="() => props.handleChange()"
        />
      </div>
    </div>

    <nested-draggable
      v-if="props.block.blocks"
      :children="props.block.blocks"
      :parent="props.block"
      :handle-change="() => props.handleChange()"
      :open-add-block-modal="props.openAddBlockModal"
    />
  </div>
</template>

<style lang="scss" scoped>
$border-radius: 14px;

.parent-block {
  position: absolute;
  display: flex;
  width: fit-content;
  min-width: 320px;
  flex-direction: column;
  border-radius: 0 $border-radius 0 $border-radius;
  backdrop-filter: blur(6px);
  background: #222222aa;
  box-shadow: 0 3px 12px #00000080;

  .output-header {
    display: flex;
    justify-content: space-between;
    padding: 10px 6px;
    border-radius: 0 $border-radius 0 0;
    margin-bottom: 0.5rem;
    background: #fff;
    color: #000;
    cursor: move;

    $iconSize: 24px;

    .activate,
    .delete {
      position: absolute;
      width: $iconSize;
      height: $iconSize;
      cursor: pointer;

      &:before,
      &:after {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        content: "";
        transform: translate(-50%, -50%);
      }
    }

    .activate {
      right: calc($iconSize + 8px);

      &:after {
        width: calc($iconSize / 3);
        height: calc($iconSize / 3);
        border: 4px solid #000;
        border-radius: 50%;
      }

      &.active {
        &:after {
          border-color: #f55858;
        }
      }
    }

    .delete {
      right: 10px;

      &:before,
      &:after {
        top: 10px;
        left: 10%;
        width: 17px;
        border-top: 4px solid #000;
      }

      &:before {
        transform: rotate(45deg);
      }

      &:after {
        transform: rotate(-45deg);
      }
    }
  }

  .param-input-container {
    padding: 0 12px;

    &:first-of-type {
      padding-top: 2px;
    }

    &:last-of-type {
      padding-bottom: 14px;
    }
  }

  &.source {
    $offset-top: -300%;
    $color: #ffffff;
    $bottom-color: #38383890;
    $offset-bottom: 150%;

    @mixin block-colors {
      background: linear-gradient(
        180deg,
        $color $offset-top,
        $bottom-color $offset-bottom
      );

      &.focused {
        background: linear-gradient(
          180deg,
          $color calc($offset-top / 2),
          $bottom-color calc($offset-bottom * 2)
        );
      }

      .output-header {
        background: $color;
      }
    }

    &:nth-child(1) {
      $color: #fff81e;
      @include block-colors();
    }

    &:nth-child(2) {
      $color: #b8f770;
      @include block-colors();
    }

    &:nth-child(3) {
      $color: #3bd5f0;
      @include block-colors();
    }

    &:nth-child(4) {
      $color: #ff8fec;
      @include block-colors();
    }

    &:nth-child(5) {
      $color: #9063f3;
      @include block-colors();
    }

    &:nth-child(6) {
      $color: #ef8c56;
      @include block-colors();
    }

    &:nth-child(7) {
      $color: #4282d6;
      @include block-colors();
    }

    &:nth-child(8) {
      $color: #ea7979;
      @include block-colors();
    }
  }

  &.external {
    .output-header {
      background: #f1a3a3;
      color: #000;
    }
  }
}
</style>
