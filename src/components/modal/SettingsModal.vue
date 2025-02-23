<script setup>
import { ref } from "vue";
import { useHydraStore } from "@/stores/hydra";
import { useAppStore } from "@/stores/app";
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
import Switch from "../ui/switch/Switch.vue";

const store = useHydraStore();
const appStore = useAppStore();

const emit = defineEmits(["close"]);

const synthSettings = ref(deepCopy(store.synthSettings));
const resolution = ref([synthSettings.value.resolution]);

const setSynthSettings = () => {
  synthSettings.value.resolution = resolution.value[0];
  store.setSynthSettings(synthSettings.value);
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
    <div class="flex flex-col space-y-4 w-3/4">
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

      <div class="flex items-center space-x-4 justify-center">
        <Switch
          id="animationSwitch"
          :checked="appStore.areAnimationsEnabled"
          class="bg-zinc-900"
          @update:checked="appStore.toggleAnimations"
        />
        <Label for="animationSwitch"> Enable animations </Label>
      </div>

      <Button variant="link" @click="download">download hydra code</Button>

      <Button variant="outline" @click="setSynthSettings">save</Button>
    </div>
  </BaseModal>
</template>

<style lang="scss" scoped></style>
