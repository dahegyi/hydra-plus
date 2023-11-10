<template>
  <draggable
    :class="[
      'drag-area',
      {
        'button-visible': !hasDraggableChild(parent),
      },
      parent.type,
    ]"
    tag="ul"
    :list="children"
    :group="{ name: 'g1' }"
    item-key="name"
    @click="handleAddBlockModal(parent)"
    @end="handleChange"
    @move="(e) => handleMove(e)"
  >
    <template #item="{ element }">
      <li :class="{ focused: focused === element }">
        <strong>
          <span class="name" @click="onFocus(element)">{{ element.name }}</span>
          <span
            class="delete"
            @click.stop="deleteChild({ element, children, parent })"
          />
        </strong>

        <div
          v-if="element.name === 'src'"
          class="param-input-container"
          @click="onFocus(element)"
        >
          <label>{{ element.params[0].name }}</label>
          <select v-model="element.params[0].value" @change="handleChange">
            <option
              v-for="(source, sIndex) in externalSourceBlocks"
              :key="sIndex"
              :value="'s' + sIndex"
            >
              s{{ sIndex }} - {{ source.name }}
            </option>
            <option
              v-for="(output, oIndex) in blocks"
              :key="oIndex"
              :value="'o' + oIndex"
            >
              o{{ oIndex }} - {{ output.name }}
            </option>
          </select>
        </div>
        <div
          v-for="(param, paramIndex) in element.params"
          v-else
          :key="paramIndex"
          class="param-input-container"
          @click="onFocus(element)"
        >
          <label>{{ param.name }}</label>
          <input
            v-model="param.value"
            type="text"
            @focusin="setInputFocus(true)"
            @focusout="handleChange"
          />
        </div>

        <ul
          v-if="canHaveChild(element.type) && !hasDraggableChild(element)"
          class="drag-area-button"
          @click="handleAddBlockModal(element)"
        />

        <nested-draggable
          v-if="canHaveChild(element.type)"
          :parent="element"
          :children="element.blocks"
          :handle-change="handleChange"
          :open-add-block-modal="openAddBlockModal"
        />
      </li>
    </template>
  </draggable>
</template>
<script>
import { mapGetters, mapActions } from "vuex";

import draggable from "vuedraggable";

import { TYPE_SRC, TYPE_COMPLEX } from "~/constants";

export default {
  components: {
    draggable,
  },

  props: {
    parent: {
      required: true,
      type: Object,
    },

    children: {
      required: true,
      type: Array,
    },

    handleChange: {
      required: true,
      type: Function,
    },

    openAddBlockModal: {
      type: Function,
      required: true,
    },
  },

  computed: mapGetters(["focused", "blocks", "externalSourceBlocks"]),

  methods: {
    ...mapActions(["setFocus", "setInputFocus", "setBlocks", "deleteChild"]),

    canHaveChild(type) {
      return type === TYPE_SRC || type === TYPE_COMPLEX;
    },

    hasDraggableChild(element) {
      return element.blocks.length > 0;
    },

    onFocus(element) {
      const focusedElement = this.canHaveChild(element.type)
        ? element
        : this.parent;

      if (this.focused === focusedElement) return;

      this.setFocus(focusedElement, true);
    },

    handleAddBlockModal(element) {
      if (this.hasDraggableChild(element)) return;

      this.onFocus(element);
      this.openAddBlockModal(element);
    },

    handleMove(e) {
      console.log(e.to.parentElement);
    },
  },
};
</script>

<style lang="scss" scoped>
$height: 65px;
$border-radius: 14px;
$spacing: 8px;

$button-text: "drag & drop or click to add";

@mixin drag-area-after {
  display: flex;
  min-height: $height;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  border-radius: 0 0 0 $border-radius;
  margin: 0;
  cursor: pointer;
}

.drag-area-button {
  position: relative;
  padding: 0;

  &::after {
    @include drag-area-after;
    margin-bottom: -$height;
    content: "";
  }
}

.drag-area {
  min-height: $height;
  padding: 0;
  border-radius: 0 0 0 $border-radius;
  margin: 0;
  background: #00000040;
  box-shadow: inset 0 0 0 1px #999;
  list-style: none;

  &.button-visible:empty {
    &::after {
      @include drag-area-after;
    }

    &.source {
      &::after {
        content: "#{$button-text} effect";
      }
    }

    &.complex {
      &::after {
        content: "#{$button-text} source";
      }
    }
  }

  li {
    padding: $spacing 0 $spacing $spacing;
    border-radius: 0 0 0 $border-radius;
    border-bottom: 2px solid #222;

    &:hover {
      background: #ffffff25;
    }

    &:last-child {
      border-bottom: none;
    }

    &.focused {
      background: #ffffff40;
    }

    strong {
      display: flex;
      margin-right: $spacing;
      cursor: pointer;
      user-select: none;

      .name {
        width: 100%;
      }

      .delete {
        position: relative;
        width: 20px;
        height: 20px;

        &:before,
        &:after {
          position: absolute;
          top: 10px;
          left: 5px;
          width: 12px;
          border-top: 2px solid #ff7979;
          content: "";
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
      margin-right: $spacing + 2;

      &:last-of-type {
        margin-bottom: $spacing;
      }
    }
  }
}
</style>
