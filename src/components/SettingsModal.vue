<template>
    <div class="modal">
        <h2>settings</h2>
        <div class="row">
            <label for="speed">speed</label>
            <input type="text" id="speed" v-model="synthSettings.speed.current" />
        </div>
        <div class="row">
            <label for="bpm">bpm</label>
            <input type="text" id="bpm" v-model="synthSettings.bpm.current" />
        </div>
        <div class="row">
            <label for="output">output</label>
            <select id="output" v-model="synthSettings.output.current">
                <option value="">select output</option>
                <option v-for="block, index in blocks" :value="index">
                    o{{ index }} - {{ block.name }}
                </option>
            </select>
        </div>

        <a href="#" @click="openVisualizer">open visualizer</a>

        <div>
            <button @click="close">cancel</button>
            <button @click="closeAndSave">save and close</button>
        </div>
    </div>
</template>
<script>
export default {
    name: "SettingsModal",

    emits: ["close", "closeAndSave"],

    props: {
        blocks: {
            type: Array,
            required: true,
        },

        synthSettings: {
            type: Object,
            required: true,
        },
    },

    methods: {
        openVisualizer() {
            window.open('/visualizer', '_blank');
        },

        close() {
            this.$emit("close");
        },

        closeAndSave() {
            this.$emit("closeAndSave");
        },
    },
};
</script>
    
<style lang="scss" scoped>
h2 {
    margin-top: 0.5rem;
}

button {
    margin: 5px;
}

.row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 1rem;

    label {
        margin-right: 1rem;
    }

    input,
    select {
        width: 60%;
        padding: 0.2rem;
        border: 1px solid #00000040;
        border-radius: 0;
        background: #000000aa;
    }
}
</style>