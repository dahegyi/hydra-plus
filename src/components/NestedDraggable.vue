<template>
  <draggable
    class="dragArea"
    tag="ul"
    :list="children"
    :group="{ name: 'g1' }"
    item-key="name"
    @end="() => onEnd()"
  >
    <template #item="{ element }">
      <li :class="{ focused: focused === element }">
        <strong>
          <span class="name" @click="onFocus(element)">{{ element.name }}</span>
          <span class="delete" @click="deleteEffect(element)" />
        </strong>

        <div
          v-if="element.name === 'src'"
          class="param-input-container"
          @click="onFocus(element)"
        >
          <label>{{ element.params[0].name }}</label>
          <select v-model="element.params[0].value">
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
          <input v-model="param.value" type="text" @focusout="update" />
        </div>

        <nested-draggable
          v-if="hasDraggableChild(element.type)"
          :children="element.blocks"
          :parent="element"
        />
      </li>
    </template>
  </draggable>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import draggable from "vuedraggable";

import { TYPE_SRC, TYPE_COMPLEX } from "@/constants";

export default {
  components: {
    draggable,
  },

  props: {
    children: {
      required: true,
      type: Array,
    },

    parent: {
      required: true,
      type: Object,
    },
  },

  computed: mapGetters(["focused", "blocks", "externalSourceBlocks"]),

  methods: {
    ...mapActions(["setFocus", "setBlocks", "update"]),

    onEnd() {
      this.setBlocks({
        blocks: [...this.blocks, ...this.externalSourceBlocks],
      });

      this.update();
    },

    deleteEffect(element) {
      const { children, parent } = this;

      for (const child of children) {
        if (child === element) {
          this.onFocus(parent);

          children.splice(children.indexOf(child), 1);

          return this.onEnd();
        }
      }
    },

    hasDraggableChild(type) {
      return type === TYPE_SRC || type === TYPE_COMPLEX;
    },

    onFocus(element) {
      if (this.hasDraggableChild(element.type)) {
        this.setFocus(element, true);
      } else {
        this.setFocus(this.parent, true);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
$darkblue: #02042c;

.dragArea {
  min-height: 40px;
  padding: 1px 0 0;
  margin: 0.5rem 0 0;
  background: #00000040;
  list-style: none;
  outline: 1px dashed #ffffff80;

  li {
    padding: 0.65rem;
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
  }
}
</style>
