<template>
    <div class="navigation">
        <div>
            <strong v-if="focused">{{ outputName }}</strong>

            <div v-if="isSourceSelectVisible">
                <select v-model="selectedSource">
                    <option value="">select source</option>
                    <option v-for="source in sources" :value="source" @change="selectedSource = source">
                        {{ source.name }}
                    </option>
                </select>
                <button @click="addSource">add source</button>
            </div>

            <div v-else>
                <select v-model="selectedEffect">
                    <option disabled value="">geometry functions</option>
                    <option v-for="fn in geometryFunctions" :value="fn">
                        {{ fn.name }}
                    </option>
                </select>
                <select v-model="selectedEffect">
                    <option disabled value="">color functions</option>
                    <option v-for="fn in colorFunctions" :value="fn">
                        {{ fn.name }}
                    </option>
                </select>
                <select v-model="selectedEffect">
                    <option disabled value="">modulate functions</option>
                    <option v-for="fn in blendFunctions" :value="fn">
                        {{ fn.name }}
                    </option>
                </select>
                <select v-model="selectedEffect">
                    <option disabled value="">modulate functions</option>
                    <option v-for="fn in modulateFunctions" :value="fn">
                        {{ fn.name }}
                    </option>
                </select>
                <button @click="addEffect">add effect</button>
            </div>
        </div>

        <div>
            <button @click="isSettingsModalOpen = true" class="settings">synth settings</button>
            <button @click="update" :disabled="isSettingsModalOpen" class="green">update</button>
            <button @click="updateAndSend" :disabled="isSettingsModalOpen" class="red">send</button>
        </div>
    </div>

    <settings-modal v-if="isSettingsModalOpen" :blocks="blocks" :synthSettings="synthSettings"
        @closeSettingsModal="closeSettingsModal" @saveAndCloseSettingsModal="saveAndCloseSettingsModal" />
</template>
<script>
import { useBroadcastChannel } from '@vueuse/core';
const { post } = useBroadcastChannel({ name: 'hydra-plus-channel' });

import { deepCopy, flatten } from '../utils/object-utils';

import {
    TYPE_SRC,
    TYPE_SIMPLE,
    TYPE_COMPLEX,
    SOURCE_FUNCTIONS,
    GEOMETRY_FUNCTIONS,
    COLOR_FUNCTIONS,
    BLEND_FUNCTIONS,
    MODULATE_FUNCTIONS,
} from "../constants";

import SettingsModal from "../components/SettingsModal.vue";

export default {
    name: "Navigation",

    emits: ["onFocus"],

    components: {
        SettingsModal
    },

    data() {
        return {
            selectedSource: "",
            selectedEffect: {
                name: "",
                type: ""
            },
            isSettingsModalOpen: false,
        }
    },

    props: {
        blocks: {
            required: true,
            type: Array
        },

        focused: {
            type: Object,
            default: null
        },

        synthSettings: {
            required: true,
            type: Object
        }
    },

    computed: {
        outputName() {
            const blockIndex = this.blocks.findIndex((block) => block === this.focused);

            if (blockIndex >= 0) {
                return `o${blockIndex} - ${this.focused.name}`;
            }

            return this.focused.name;
        },

        isFocusNameVisible() {
            return this.outputName && this.focused?.name;
        },

        isSourceSelectVisible() {
            return (this.focused?.type !== TYPE_SRC && this.focused?.type !== TYPE_SIMPLE);
        },

        sources() {
            return SOURCE_FUNCTIONS.map((fn) => ({ ...fn, type: TYPE_SRC }));
        },

        geometryFunctions() {
            return GEOMETRY_FUNCTIONS.map((fn) => ({ ...fn, type: TYPE_SIMPLE }));
        },

        colorFunctions() {
            return COLOR_FUNCTIONS.map((fn) => ({ ...fn, type: TYPE_SIMPLE }));
        },

        blendFunctions() {
            return BLEND_FUNCTIONS.map((fn) => ({ ...fn, type: TYPE_COMPLEX }));
        },

        modulateFunctions() {
            return MODULATE_FUNCTIONS.map((fn) => ({ ...fn, type: TYPE_COMPLEX }));
        },
    },

    methods: {
        onFocus(focusedBlock) {
            this.$emit("onFocus", focusedBlock, true);
        },

        /**
         * Adds source to the main code block or to a child block.
         * Deep copy is needed because we want to handle the input parameters
         * differently for different sources.
         */
        addSource() {
            if (!this.selectedSource) {
                return;
            }

            const copiedObject = deepCopy(
                { ...this.selectedSource, type: TYPE_SRC, blocks: [], position: { x: 20, y: 60 } }
            );

            if (!this.focused && this.blocks.length < 4) {
                this.blocks.push(copiedObject);

                this.onFocus(this.blocks[this.blocks.length - 1]);

                this.synthSettings.output = { current: this.blocks.length - 1, previous: this.blocks.length - 1 };

                this.selectedSource = "";
            } else if (this.focused) {
                this.focused.blocks.push(copiedObject);
            }
        },

        /**
         * Adds effect block to the focused block as a child.
        */
        addEffect() {
            const { focused, selectedEffect } = this;

            if (selectedEffect.name && focus) {
                this.focused.blocks.push(
                    deepCopy(selectedEffect)
                );
            }

            if (selectedEffect.type === TYPE_COMPLEX) {
                this.onFocus(focused.blocks[focused.blocks.length - 1]);
            }

            this.selectedEffect = {
                effect: "",
                type: ""
            };
        },

        closeSettingsModal() {
            // @TODO ask user if they want to save changes
            this.synthSettings.bpm.current = this.synthSettings.bpm.previous;
            this.synthSettings.speed.current = this.synthSettings.speed.previous;
            this.synthSettings.output.current = this.synthSettings.output.previous;

            this.isSettingsModalOpen = false;
        },

        saveAndCloseSettingsModal() {
            const synthBpm = this.synthSettings.bpm;
            const synthSpeed = this.synthSettings.speed;

            if (synthBpm.current !== synthBpm.previous) {
                eval(`bpm = ${synthBpm.current}`)
                post(`bpm = ${synthBpm.current}`);
                synthBpm.previous = synthBpm.current;
            }

            if (synthSpeed.current !== synthSpeed.previous) {
                eval(`speed = ${synthSpeed.current}`)
                post(`speed = ${synthSpeed.current}`);
                synthSpeed.previous = synthSpeed.current;
            }

            this.isSettingsModalOpen = false;
        },

        update() {
            let codeString;

            if (this.blocks.length === 0) {
                codeString = "hush()";
            } else {
                codeString = flatten(this.blocks[this.synthSettings.output.current]);
            }

            // console.log(this.blocks, codeString);

            try {
                eval(`${codeString}.out()`);
                this.error = null;
            } catch (error) {
                this.error = error;
            }
        },

        updateAndSend() {
            this.update();

            if (!this.error) {
                const codeString = flatten(this.blocks[this.synthSettings.output.current]);
                post(`${codeString}.out()`);
            }

            localStorage.setItem("blocks", JSON.stringify(this.blocks));
            localStorage.setItem("synthSettings", JSON.stringify(this.synthSettings));
        }
    },
};
</script>
    
<style lang="scss" scoped>
.navigation {
    position: fixed;
    width: calc(100% - 12px);
    top: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px;
    background: #222222bb;
    backdrop-filter: blur(5px);
    z-index: 1;

    div {
        display: flex;
        align-items: center;

        * {
            margin-right: 0.5rem;

            &:last-child {
                margin-right: 0;
            }
        }
    }

    select {
        padding: 0.4rem 0.25rem;
        background: #74757a;
    }

    button {
        padding: 0.5rem 1rem;
        background: #444;
        border: 1px solid #22222240;
        border-radius: 0;
        color: #fff;
        cursor: pointer;
        transition: all 0.1s ease-in-out;

        &.settings {
            margin-right: 2rem;
        }

        &.green {
            border: 1px solid #84ff84;
        }

        &.red {
            border: 1px solid #ee6060;
        }

        &:hover {
            background: #333;
        }
    }
}
</style>