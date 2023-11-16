<script setup>
import { useStore } from "vuex";
import { stateToProps, createDispatchAction } from "~/utils/vuex-utils";

import { TYPE_SRC, PARAM_MAPPINGS } from "~/constants";

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

<!-- 
  eslint-disable vue/no-mutating-props

  'vue/no-mutating-props' is disabled because the props are not displayed anywhere else in the app.
  The state has to be updated on input change, but the update should be only called when exiting the input focus.
  I concider this applicable for this case.

  @todo: param component
-->

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
      <div
        class="output-header"
        @mousedown="(e) => props.moveBlock(e, props.index, props.block.type)"
      >
        <div id="drag-handle" class="drag-handle" />

        {{ blockHeader }}

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
      </div>

      <div>
        <div
          v-for="(param, paramIndex) in props.block.params?.length"
          :key="paramIndex"
          class="param-input-container"
        >
          <label>{{ PARAM_MAPPINGS[props.block.name][paramIndex] }}</label>

          <select
            v-if="props.block.name === 'src'"
            v-model="props.block.params[paramIndex]"
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
            v-model="props.block.params[paramIndex]"
            type="text"
            @focusin="setInputFocus(true)"
            @focusout="() => props.handleChange()"
          />
        </div>
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
@import "~/assets/styles/variables";

$spacing: 8px;

.parent-block {
  position: absolute;
  display: flex;
  width: fit-content;
  width: min(360px, 80%);
  flex-direction: column;
  border-radius: 0 $border-radius 0 $border-radius;
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  background: #222222aa;
  box-shadow: 0 3px 12px #00000080;

  .output-header {
    display: flex;
    justify-content: space-between;
    padding: $spacing calc($spacing / 2);
    border-radius: 0 $border-radius 0 0;
    background: #fff;
    color: #000;
    cursor: move;
    font-weight: bold;

    $iconSize: 3 * $spacing;

    .drag-handle {
      top: 0;
      left: 0;
      width: $iconSize;
      height: $iconSize;
      margin-right: -$iconSize;
      cursor: grab;
    }

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
      right: calc($iconSize + $spacing);
      width: calc($spacing * 2.5);

      &:after {
        width: calc($iconSize / 3);
        height: calc($iconSize / 3);
        border: calc($spacing / 2) solid #000;
        border-radius: 50%;
      }

      &.active {
        &:after {
          border-color: $color-red;
        }
      }
    }

    .delete {
      right: calc($spacing * 1.5);
      width: calc($spacing * 2.5);

      &:before,
      &:after {
        top: calc($spacing * 1.25);
        left: calc($spacing / 4);
        width: calc($spacing * 2);
        border-top: calc($spacing / 2) solid #000;
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
    padding: calc($spacing / 4) $spacing;

    &:first-of-type {
      padding-top: $spacing;
    }

    &:last-of-type {
      padding-bottom: $spacing;
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
    }

    .param-input-container {
      padding: calc($spacing * 1.5) $spacing calc($spacing * 1.5)
        calc($spacing * 1.5);
    }
  }
}
</style>
