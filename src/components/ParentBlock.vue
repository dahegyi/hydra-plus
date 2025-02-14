<script setup>
import { computed, ref, onMounted } from "vue";
import { useHydraStore } from "@/stores/hydra";

import { showToast } from "@/utils";

import { TYPE_SRC, TYPE_THREE, PARAM_MAPPINGS } from "@/constants";

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
    showToast("Error accessing video devices:", error);
  }
});

const togglePreview = () => {
  isPreviewOpen.value = !isPreviewOpen.value;
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
      { focused: store.focused === props.block },
    ]"
  >
    <div
      class="output-header"
      @click="store.setFocus(store.blocks[props.index])"
      @mousedown="(e) => props.moveBlock(e, props.index, props.block.type)"
      @touchstart="(e) => props.moveBlock(e, props.index, props.block.type)"
    >
      <div id="drag-handle" class="drag-handle" />

      {{ blockHeader }}

      <div>
        <span
          v-if="props.block.type === TYPE_SRC"
          :class="[
            'activate',
            { active: store.synthSettings.output === props.index },
          ]"
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
          @click="
            store.deleteParent({ type: props.block.type, index: props.index })
          "
          @touchstart="
            store.deleteParent({ type: props.block.type, index: props.index })
          "
        />
      </div>
    </div>

    <div v-if="props.block.type !== TYPE_THREE">
      <div
        v-for="(param, paramIndex) in props.block.params?.length"
        :key="paramIndex"
        class="param-input-container"
      >
        <label>{{ PARAM_MAPPINGS[props.block.name][paramIndex] }}</label>

        <select
          v-if="props.block.name === 'initCam'"
          v-model="props.block.params[paramIndex]"
          @change="() => props.handleChange()"
        >
          <option
            v-for="(name, camIndex) in cameraNames"
            :key="'cam' + camIndex"
            :value="camIndex"
          >
            {{ name }}
          </option>
        </select>

        <select
          v-else-if="props.block.name === 'src'"
          v-model="props.block.params[paramIndex]"
          @change="() => props.handleChange()"
        >
          <option
            v-for="(source, sIndex) in store.externalSourceBlocks"
            :key="'s' + sIndex"
            :value="'s' + sIndex"
          >
            s{{ sIndex }} - {{ source.name }}
          </option>
          <option
            v-for="(output, oIndex) in store.blocks"
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
          @focusin="store.setInputFocus(true)"
          @focusout="() => props.handleChange()"
        />
      </div>

      <div v-if="isPreviewOpen">
        <img
          v-if="props.block.name === 'initImage'"
          :src="hydra[`s${index}`].src?.src"
        />

        <video
          v-else-if="props.block.name === 'initVideo'"
          :src="hydra[`s${index}`].src?.src"
          autoplay
          muted
          loop
        />

        <video
          v-else-if="
            props.block.name === 'initCam' || props.block.name === 'initScreen'
          "
          :srcObject="hydra[`s${index}`].src?.srcObject"
          :class="props.block.name"
          autoplay
          muted
        />

        <!-- @todo 3D preview -->
      </div>
    </div>

    <div v-else>
      <div class="param-input-container">
        <label>3D settings</label>

        <button @click="openThreeModal">Open 3D settings</button>
      </div>
    </div>

    <nested-draggable
      v-if="props.block.blocks"
      :parent="props.block"
      :handle-change="() => props.handleChange()"
      :open-add-block-modal="props.openAddBlockModal"
    />
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/variables" as *;

$spacing: 8px;

.parent-block {
  position: absolute;
  display: flex;
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
        border-top: 2px solid #000;
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

    img,
    video {
      width: calc(100% - #{$spacing * 2});
      max-height: 200px;
      border-radius: 0 0 0 $border-radius;
      margin: 0 $spacing;
      object-fit: cover;
    }

    // initScreen doesn't have inputs so margin is needed
    .initScreen {
      margin-top: calc($spacing * 1.5);
    }
  }
}
</style>
