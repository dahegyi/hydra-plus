<script setup>
import { watch } from "vue";
import { useBroadcastChannel } from "@vueuse/core";

// import { onMIDISuccess, onMIDIFailure } from "@/utils/midi-utils";

const { data } = useBroadcastChannel({ name: "hydra-plus-channel" });

watch(data, () => {
  if (data.value) eval(data.value);
});

// onMounted(() => {
//   navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
// });
</script>
