<script setup>
import { TYPE_SRC, TYPE_COMPLEX, PARAM_MAPPINGS } from "@/constants";
import { generateUniqueId } from "@/utils";
import { useHydraStore } from "@/stores/hydra";

import Draggable from "vuedraggable";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";

const props = defineProps({
  parent: {
    required: true,
    type: Object,
  },
  handleChange: {
    required: true,
    type: Function,
  },
  openAddBlockModal: {
    type: Function,
    required: true,
  },
  path: {
    type: String,
    default: "",
  },
});

const store = useHydraStore();

const canHaveChild = (element) => {
  return (
    element.type === TYPE_SRC ||
    (element.type === TYPE_COMPLEX && element.blocks.length === 0)
  );
};

const canHaveSourceChild = (element) => {
  return element.type === TYPE_COMPLEX && element.blocks.length === 0;
};

const canHaveEffectChild = (element) => {
  return element.type === TYPE_SRC;
};

const handleAddBlockModal = (element) => {
  store.setFocus(element);
  props.openAddBlockModal(element);
};

// @todo disallow illegal moves
const handleMove = () => {};

const handleEnd = () => {
  props.handleChange();
};

// context menu

const canPasteChild = (element) => {
  store.setFocus(element);
  return store.canPaste;
};

const cut = (element) => {
  store.setFocus(element, props.parent);
  store.copyBlock(true);
};

const copy = (element) => {
  store.setFocus(element);
  store.copyBlock();
};

const paste = (element) => {
  store.setFocus(element);
  store.pasteBlock();
};
</script>

<template>
  <Draggable
    :class="[
      {
        'button-visible': canHaveChild(parent),
      },
      parent.type,
    ]"
    tag="ul"
    :list="parent.blocks"
    :group="{ name: 'g1' }"
    :animation="200"
    item-key="name"
    @click.stop="handleAddBlockModal(parent)"
    @move="(e) => handleMove(e)"
    @end="handleEnd"
  >
    <template #item="{ element }">
      <li :class="{ focused: store.focused === element }" @click.stop="">
        <ContextMenu>
          <ContextMenuTrigger>
            <div class="params">
              <strong>
                <span
                  class="name"
                  @click.stop="store.setFocus(element, parent)"
                >
                  {{ element.name }}
                </span>
                <span
                  class="delete"
                  @click.stop="store.deleteChild({ element, parent })"
                />
              </strong>

              <div
                v-if="element.name === 'src'"
                class="flex items-center"
                @click.stop="store.setFocus(element, parent)"
              >
                <Select
                  v-model="element.params[0]"
                  @update:model-value="handleChange"
                >
                  <SelectTrigger class="bg-zinc-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="(source, sIndex) in store.externalSourceBlocks"
                      :key="sIndex"
                      :value="'s' + sIndex"
                    >
                      s{{ sIndex }} - {{ source.name }}
                    </SelectItem>
                    <SelectItem
                      v-for="(output, oIndex) in store.blocks"
                      :key="oIndex"
                      :value="'o' + oIndex"
                    >
                      o{{ oIndex }} - {{ output.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div
                v-for="(param, paramIndex) in element.params?.length"
                v-else
                :key="paramIndex"
                class="flex items-center"
                @click.stop="store.setFocus(element, parent)"
              >
                <Label
                  :for="
                    generateUniqueId(`${path}.${element.name}.${paramIndex}`)
                  "
                  class="min-w-24"
                >
                  {{ PARAM_MAPPINGS[element.name][paramIndex] }}
                </Label>
                <Input
                  :id="
                    generateUniqueId(`${path}.${element.name}.${paramIndex}`)
                  "
                  v-model="element.params[paramIndex]"
                  class="bg-zinc-900"
                  @focusin="store.setInputFocus(true)"
                  @focusout="handleChange"
                />
              </div>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem
              v-if="canHaveSourceChild(element)"
              @click="handleAddBlockModal(element)"
            >
              Add source
            </ContextMenuItem>
            <ContextMenuItem
              v-if="canHaveEffectChild(element)"
              @click="handleAddBlockModal(element)"
            >
              Add effect
            </ContextMenuItem>
            <ContextMenuSeparator v-if="canHaveChild(element)" />
            <ContextMenuItem @click="cut(element)">Cut</ContextMenuItem>
            <ContextMenuItem @click="copy(element)">Copy</ContextMenuItem>
            <ContextMenuItem
              :disabled="!canPasteChild(element)"
              @click="paste(element)"
            >
              Paste
            </ContextMenuItem>
            <ContextMenuItem @click="store.deleteChild({ element, parent })">
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        <NestedDraggable
          v-if="element.blocks"
          :parent="element"
          :handle-change="handleChange"
          :open-add-block-modal="openAddBlockModal"
          :path="path + '.' + element.name"
        />
      </li>
    </template>
  </Draggable>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/variables" as *;

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
  list-style: none;

  &.button-visible {
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

      > ul.button-visible {
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
      background: #ffffff16;
    }

    &:last-child {
      border-bottom: none;
    }

    &.focused {
      background: #ffffff30;
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

input {
  font-family: "Fira Code", monospace;
  font-size: 0.8em;
}
</style>
