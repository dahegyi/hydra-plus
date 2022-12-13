<template>
    <div class="settings-modal">
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

        <div>
            <button @click="closeSettingsModal">cancel</button>
            <button @click="saveAndCloseSettingsModal">save and close</button>
        </div>
    </div>
</template>
<script>
export default {
    name: "SettingsModal",

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
        closeSettingsModal() {
            this.$emit("closeSettingsModal");
        },

        saveAndCloseSettingsModal() {
            this.$emit("saveAndCloseSettingsModal");
        },
    },
};
</script>
    
<style lang="scss" scoped>
.settings-modal {
    position: fixed;
    display: flex;
    align-items: center;
    flex-direction: column;
    z-index: 999;
    top: 20%;
    left: calc(50% - 150px);
    width: 300px;
    background: #222222bb;
    backdrop-filter: blur(5px);
    padding: 20px;
    border-radius: 10px;

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
}
</style>