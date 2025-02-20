<script setup>
import { computed, ref, onMounted } from "vue";
import { useHydraStore } from "@/stores/hydra";

import { showErrorToast } from "@/utils";

import { TYPE_SRC, TYPE_THREE, PARAM_MAPPINGS } from "@/constants";

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
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

import NestedDraggable from "@/components/NestedDraggable";

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

const store = useHydraStore();

const blockHeader = computed(() => {
  return `${props.block.type === TYPE_SRC ? "o" : "s"}${props.index} - ${
    props.block.name
  }`;
});

const isActive = computed(() => store.synthSettings.output === props.index);

const hydra = ref(window.hydra);
const cameraNames = ref([]);
const isPreviewOpen = ref(false);

onMounted(async () => {
  if (props.block.name !== "initCam") return;

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoInputs = devices.filter(
      (device) => device.kind === "videoinput",
    );

    for (const [i, videoInput] of videoInputs.entries()) {
      cameraNames.value.push(`${i} - ${videoInput.label}`);
    }
  } catch (error) {
    showErrorToast("Error accessing video devices:", error);
  }
});

const togglePreview = () => {
  isPreviewOpen.value = !isPreviewOpen.value;
};

const showLabel = (blockName) => {
  return blockName !== "initCam" && blockName !== "src";
};

const cut = () => {
  store.setFocus(props.block);
  store.copyBlock(true);
};

const copy = () => {
  store.setFocus(props.block);
  store.copyBlock();
};

const paste = () => {
  store.setFocus(props.block);
  store.pasteBlock();
};

const deleteParent = () => {
  store.deleteParent({
    type: props.block.type,
    index: props.index,
  });
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
  <ContextMenu>
    <ContextMenuTrigger>
      <div
        :id="`${block.type}-block-${index}`"
        :class="[
          'parent-block',
          block.type,
          { focused: store.focused === block },
        ]"
      >
        <div
          class="output-header"
          @mousedown="(e) => moveBlock(e, index, block.type)"
          @touchstart="(e) => moveBlock(e, index, block.type)"
        >
          <div id="drag-handle" class="drag-handle" />

          {{ blockHeader }}

          <div>
            <span
              v-if="block.type === TYPE_SRC"
              :class="['activate', { active: isActive }]"
              @click="store.setOutput(index)"
              @touchstart="store.setOutput(index)"
            />

            <span
              v-else
              :class="['preview', { open: isPreviewOpen }]"
              @click="togglePreview"
              @touchstart="togglePreview"
            />

            <span
              class="delete"
              @click="deleteParent"
              @touchstart="deleteParent"
            />
          </div>
        </div>

        <div v-if="block.type !== TYPE_THREE">
          <div
            v-for="(param, paramIndex) in block.params?.length"
            :key="paramIndex"
            class="param-input-container flex"
          >
            <Label
              v-if="showLabel(block.name)"
              :for="`${block.type}-block-${index}-param-${paramIndex}`"
              class="min-w-24"
            >
              {{ PARAM_MAPPINGS[block.name][paramIndex] }}
            </Label>

            <Select
              v-if="block.name === 'initCam'"
              :id="`${block.type}-block-${index}-param-${paramIndex}`"
              v-model="block.params[paramIndex]"
              @update:model-value="handleChange"
            >
              <SelectTrigger class="bg-zinc-900">
                <SelectValue>
                  {{ cameraNames[block.params[paramIndex]] }}
                </SelectValue>
              </SelectTrigger>

              <SelectContent>
                <SelectItem
                  v-for="(name, camIndex) in cameraNames"
                  :key="'cam' + camIndex"
                  :value="String(camIndex)"
                >
                  {{ name }}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              v-else-if="block.name === 'src'"
              :id="`${block.type}-block-${index}-param-${paramIndex}`"
              v-model="block.params[paramIndex]"
              @update:model-value="handleChange"
            >
              <SelectTrigger class="bg-zinc-900">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem
                  v-for="(source, sIndex) in store.externalSourceBlocks"
                  :key="`s${sIndex}`"
                  :value="`s${sIndex}`"
                >
                  s{{ sIndex }} - {{ source.name }}
                </SelectItem>
                <SelectItem
                  v-for="(output, oIndex) in store.blocks"
                  :key="`o${oIndex}`"
                  :value="`o${oIndex}`"
                >
                  o{{ oIndex }} - {{ output.name }}
                </SelectItem>
              </SelectContent>
            </Select>

            <Input
              v-else
              :id="`${block.type}-block-${index}-param-${paramIndex}`"
              v-model="block.params[paramIndex]"
              class="bg-zinc-900 my-0"
              @focusin="store.setInputFocus(true)"
              @focusout="() => handleChange()"
            />
          </div>

          <div v-if="isPreviewOpen">
            <img
              v-if="block.name === 'initImage'"
              :src="hydra[`s${index}`].src?.src"
            />

            <video
              v-else-if="block.name === 'initVideo'"
              :src="hydra[`s${index}`].src?.src"
              autoplay
              muted
              loop
            />

            <video
              v-else-if="
                block.name === 'initCam' || block.name === 'initScreen'
              "
              :srcObject="hydra[`s${index}`].src?.srcObject"
              :class="block.name"
              autoplay
              muted
            />

            <!-- @todo 3D preview -->
          </div>
        </div>

        <div v-else>
          <div class="param-input-container">
            <button @click="openThreeModal">Open 3D settings</button>
          </div>
        </div>

        <nested-draggable
          v-if="block.blocks"
          :parent="block"
          :handle-change="() => handleChange()"
          :open-add-block-modal="openAddBlockModal"
        />
      </div>
    </ContextMenuTrigger>
    <ContextMenuContent>
      <ContextMenuCheckboxItem
        :checked="isActive"
        @click="store.setOutput(index)"
      >
        Set active output
      </ContextMenuCheckboxItem>
      <ContextMenuSeparator />
      <ContextMenuItem @click="openAddBlockModal(block)">
        New effect
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem @click="cut">Cut</ContextMenuItem>
      <ContextMenuItem @click="copy">Copy</ContextMenuItem>
      <ContextMenuItem @click="paste">Paste</ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem @click="deleteParent">Delete</ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/variables" as *;

$spacing: 8px;

.parent-block {
  position: absolute;
  display: flex;
  overflow: hidden;
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
    -webkit-user-select: none;
    user-select: none;

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
    .preview,
    .delete {
      position: absolute;
      width: $iconSize;
      height: $iconSize;
      cursor: pointer;
    }

    .activate,
    .delete {
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
        width: calc($iconSize / 1.5);
        height: calc($iconSize / 1.5);
        border: calc($spacing / 2) solid #000;
        border-radius: 50%;
      }

      &.active {
        &:after {
          border-color: $color-red;
        }
      }
    }

    .preview {
      top: calc($spacing + 1px);
      right: calc($iconSize + $spacing * 1.5);
      width: calc($iconSize - 2px);
      background-image: url(@/assets/eye-off.svg);
      background-repeat: no-repeat;
      background-size: contain;

      &.open {
        background-image: url(@/assets/eye-show.svg);
      }
    }

    .delete {
      right: calc($spacing * 1.5);
      width: calc($spacing * 2.5);

      &:before,
      &:after {
        top: calc($spacing * 1.4);
        left: calc($spacing / 4);
        width: calc($spacing * 2);
        border-top: 3px solid #000;
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

    label {
      display: flex;
      align-items: center;
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

    &#source-block-0 {
      $color: #fff81e;
      @include block-colors();
    }

    &#source-block-1 {
      $color: #b8f770;
      @include block-colors();
    }

    &#source-block-2 {
      $color: #3bd5f0;
      @include block-colors();
    }

    &#source-block-3 {
      $color: #ff8fec;
      @include block-colors();
    }

    &#source-block-4 {
      $color: #9063f3;
      @include block-colors();
    }

    &#source-block-5 {
      $color: #ef8c56;
      @include block-colors();
    }

    &#source-block-6 {
      $color: #4282d6;
      @include block-colors();
    }

    &#source-block-7 {
      $color: #ea7979;
      @include block-colors();
    }
  }

  &.external {
    .output-header {
      background: #f1a3a3;
    }

    img,
    video {
      width: 100%;
      max-height: 200px;
      object-fit: cover;
    }
  }
}

input {
  font-family: "Fira Code", monospace;
  font-size: 0.8em;
}
</style>
