<template>
  <draggable
    :class="[
      'drag-area',
      {
        'button-visible': canHaveChild(parent),
      },
      parent.type,
    ]"
    tag="ul"
    :list="children"
    :group="{ name: 'g1' }"
    item-key="name"
    @click.stop="handleAddBlockModal(parent)"
    @move="(e) => handleMove(e)"
    @end="handleEnd"
  >
    <template #item="{ element }">
      <li :class="{ focused: focused === element }" @click.stop="">
        <div class="params">
          <strong>
            <span class="name" @click.stop="onFocus(element)">
              {{ element.name }}
            </span>
            <span
              class="delete"
              @click.stop="deleteChild({ element, children, parent })"
            />
          </strong>

          <div
            v-if="element.name === 'src'"
            class="param-input-container"
            @click.stop="onFocus(element)"
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
            @click.stop="onFocus(element)"
          >
            <label>{{ param.name }}</label>
            <input
              v-model="param.value"
              type="text"
              @focusin="setInputFocus(true)"
              @focusout="handleChange"
            />
          </div>
        </div>

        <nested-draggable
          v-if="element.blocks"
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

  data() {
    return {
      previouslyDraggedTo: null,
    };
  },

  computed: mapGetters(["focused", "blocks", "externalSourceBlocks"]),

  methods: {
    ...mapActions(["setFocus", "setInputFocus", "setBlocks", "deleteChild"]),

    canHaveChild(element) {
      return (
        element.type === TYPE_SRC ||
        (element.type === TYPE_COMPLEX && element.blocks.length === 0)
      );
    },

    onFocus(element) {
      const focusedElement = this.canHaveChild(element) ? element : this.parent;

      if (this.focused === focusedElement) return;

      this.setFocus(focusedElement, true);
    },

    handleAddBlockModal(element) {
      this.onFocus(element);
      this.openAddBlockModal(element);
    },

    handleMove(e) {
      if (this.previouslyDraggedTo) {
        this.previouslyDraggedTo.classList.remove("dragging");
      }

      this.previouslyDraggedTo = e.to;

      if (
        e.to !== e.from &&
        e.to.classList.contains("button-visible") &&
        !e.to.classList.contains("dragging")
      ) {
        e.to.classList.add("dragging");
      }
    },

    handleEnd() {
      if (this.previouslyDraggedTo) {
        this.previouslyDraggedTo.classList.remove("dragging");
      }

      this.handleChange();
    },
  },
};
</script>

<style lang="scss" scoped>
$height: 65px;
$border-radius: 14px;
$spacing: 7px;

$button-text: "drag & drop or click to add";

.drag-area {
  min-height: $height;
  padding: 0;
  border-radius: 0 0 0 $border-radius;
  margin: 0;
  background: #00000040;
  box-shadow: inset 0 0 0 1px #999;
  list-style: none;

  &.button-visible {
    &.dragging {
      &::after {
        display: none;
      }
    }

    &::after {
      display: flex;
      min-height: $height;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      border-radius: 0 0 0 $border-radius;
      border-top: 1px solid #999;
      margin: 0;
      cursor: pointer;
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

      + li {
        border-radius: 0 0 0 $border-radius;
      }
    }
  }

  &.complex {
    li {
      padding: 0;

      .params {
        padding: $spacing;
      }
    }

    > li:first-of-type {
      border-radius: 0 0 0 $border-radius;
    }
  }

  li {
    padding: $spacing 0 $spacing $spacing;
    border-bottom: 1px solid #999;

    &:hover {
      background: #ffffff25;
    }

    &:last-child {
      border-bottom: none;
      // border-radius: 0 0 0 $border-radius;
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
