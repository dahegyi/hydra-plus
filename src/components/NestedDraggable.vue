<template>
  <draggable
    :class="[
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
            <label>{{ PARAM_MAPPINGS[element.name][0] }}</label>
            <select v-model="element.params[0]" @change="handleChange">
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
            v-for="(param, paramIndex) in element.params?.length"
            v-else
            :key="paramIndex"
            class="param-input-container"
            @click.stop="onFocus(element)"
          >
            <label>{{ PARAM_MAPPINGS[element.name][paramIndex] }}</label>
            <input
              v-model="element.params[paramIndex]"
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

import { TYPE_SRC, TYPE_COMPLEX, PARAM_MAPPINGS } from "~/constants";

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
      PARAM_MAPPINGS, // @todo: can be removed when component is in options api format
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
@import "~/assets/styles/variables";

$height: 65px;
$spacing: 8px;

$button-text: "drag & drop or click to add";

ul {
  display: block;
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
      border-radius: 0 0 0 $border-radius-sm;
      margin: 0 0;
      color: #ddd;
      cursor: pointer;
      font-size: 0.9rem;
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
        border-radius: 0 0 0 $border-radius-sm;
      }
    }
  }

  &.complex {
    li {
      padding: $spacing 0 0 $spacing;

      > ul {
        margin-left: -$spacing;
      }
    }

    > li:first-of-type {
      border-radius: 0 0 0 $border-radius-sm;
    }
  }

  &.source {
    > li {
      padding: $spacing 0 $spacing $spacing;
    }
  }

  ul {
    border-radius: 0 0 0 $border-radius-sm;
  }

  li {
    padding: $spacing 0 $spacing $spacing;

    &:nth-child(odd) {
      background: #22222210;
    }

    &:nth-child(even) {
      background: #ffffff10;
    }

    &:hover {
      background: #ffffff25;
    }

    &:last-child {
      border-bottom: none;
    }

    &.focused {
      background: #ffffff40;
    }

    .params {
      padding: 0 $spacing 0 0;

      strong {
        padding: 0 0 calc($spacing / 2);
      }

      div {
        &:last-of-type {
          padding-bottom: $spacing;
        }
      }
    }

    strong {
      display: flex;
      cursor: pointer;
      -webkit-user-select: none;
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
  }
}
</style>
