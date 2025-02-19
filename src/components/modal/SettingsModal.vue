<script setup>
import { computed, ref } from "vue";
import { useHydraStore } from "@/stores/hydra";
import { deepCopy } from "@/utils/object-utils";

import BaseModal from "./BaseModal";

import { Label } from "@/components/ui/label";
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/components/ui/number-field";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

const store = useHydraStore();

const emit = defineEmits(["close"]);

const activeTab = ref(0);

const synthSettings = ref(deepCopy(store.synthSettings));
const resolution = ref([synthSettings.value.resolution]);

const setSynthSettings = () => {
  synthSettings.value.resolution = resolution.value[0];
  store.setSynthSettings(synthSettings.value);
};

const red = ref("1");
const green = ref("1");
const blue = ref("1");

const arePhilipsHueSettingsAvailabe = computed(
  () => process.env.NODE_ENV !== "production",
);

const updateRGB = (rgb) => {
  store.updateRGB(rgb);
};

// @todo extract this
const download = () => {
  const code = store.codeString;
  const blob = new Blob([code], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const formattedDatetime = new Date().toISOString().replace(/:/g, "-");
  const a = document.createElement("a");
  a.href = url;
  a.download = `hydra-plus-export-${formattedDatetime}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};

const close = () => {
  emit("close");
};
</script>

<template>
  <BaseModal modal-name="SettingsModal" @close="close">
    <!-- <div class="tab-select">
      <button :class="{ active: activeTab === 0 }" @click="activeTab = 0">
        synth settings
      </button>

      <button :class="{ active: activeTab === 1 }" @click="activeTab = 1">
        philips hue settings
      </button>
    </div> -->

    <div v-if="activeTab === 0" class="flex flex-col space-y-4 w-3/4">
      <Label for="resolution">Resolution</Label>
      <Slider id="resolution" v-model="resolution" :max="100" />

      <NumberField
        id="speed"
        v-model="synthSettings.speed"
        :step="0.01"
        :format-options="{
          style: 'percent',
        }"
      >
        <Label for="speed">Speed</Label>
        <NumberFieldContent>
          <NumberFieldDecrement />
          <NumberFieldInput class="bg-zinc-900" />
          <NumberFieldIncrement />
        </NumberFieldContent>
      </NumberField>

      <NumberField id="bpm" v-model="synthSettings.bpm" :step="1" :min="0">
        <Label for="bpm">BPM</Label>
        <NumberFieldContent>
          <NumberFieldDecrement />
          <NumberFieldInput class="bg-zinc-900" />
          <NumberFieldIncrement />
        </NumberFieldContent>
      </NumberField>

      <NumberField id="fps" v-model="synthSettings.fps" :step="1" :min="0">
        <Label for="fps">FPS</Label>
        <NumberFieldContent>
          <NumberFieldDecrement />
          <NumberFieldInput class="bg-zinc-900" />
          <NumberFieldIncrement />
        </NumberFieldContent>
      </NumberField>

      <Button variant="link" @click="download">download hydra code</Button>

      <Button variant="outline" @click="setSynthSettings">save</Button>
    </div>

    <div v-else-if="activeTab === 1" class="tab-content">
      <div v-if="arePhilipsHueSettingsAvailabe">
        <p>philips hue settings - experimental</p>

        <!-- @todo connection settings -->

        <div class="row">
          <label>red</label>
          <input
            v-model="red"
            type="number"
            @focusout="updateRGB({ red, green, blue })"
          />
        </div>

        <div class="row">
          <label>green</label>
          <input
            v-model="green"
            type="number"
            @focusout="updateRGB({ red, green, blue })"
          />
        </div>

        <div class="row">
          <label>blue</label>
          <input
            v-model="blue"
            type="number"
            @focusout="updateRGB({ red, green, blue })"
          />
        </div>
      </div>
      <div v-else>
        <p>not available in production</p>
      </div>
    </div>
  </BaseModal>
</template>

<style lang="scss" scoped></style>
