<template>
    <div class="navigation">
        <div>
            <strong v-if="focused">{{ outputName }}</strong>

            <div class="dropdown">
                <button>new {{ isSourceSelectVisible ? 'source' : 'effect' }}</button>
                <ul class="dropdown-content">
                    <li v-if="isSourceSelectVisible" v-for="source in sources" @click="addSource(source)">
                        {{ source.name }}
                    </li>
                    <li v-else v-for="functions in functionGroups" :key="functions.name" class="dropdown">
                        {{ functions.name }}
                        <ul class="dropdown-content">
                            <li v-for="fn in functions.fns" :key="fn.name" @click="addEffect(fn)">
                                {{ fn.name }}
                            </li>
                        </ul>
                    </li>
                </ul>
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

        functionGroups() {
            return [
                { name: "geometry", fns: GEOMETRY_FUNCTIONS, type: TYPE_SIMPLE },
                { name: "color", fns: COLOR_FUNCTIONS, type: TYPE_SIMPLE },
                { name: "blend", fns: BLEND_FUNCTIONS, type: TYPE_COMPLEX },
                { name: "modulate", fns: MODULATE_FUNCTIONS, type: TYPE_COMPLEX },
            ];
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
        addSource(source) {
            const copiedObject =
                { ...source, type: TYPE_SRC, blocks: [], position: { x: 20, y: 60 } }
                ;

            if (!this.focused && this.blocks.length < 4) {
                this.blocks.push(copiedObject);

                this.onFocus(this.blocks[this.blocks.length - 1]);

                this.synthSettings.output = { current: this.blocks.length - 1, previous: this.blocks.length - 1 };
            } else if (this.focused) {
                this.focused.blocks.push(copiedObject);
            }
        },

        /**
         * Adds effect block to the focused block as a child.
        */
        addEffect(effect) {
            if (!this.focused) {
                return;
            }

            this.focused.blocks.push(effect);

            if (effect.type === TYPE_COMPLEX) {
                this.onFocus(focused.blocks[focused.blocks.length - 1]);
            }
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

    @mixin dropdown {
        display: none;

        button {
            margin: 0;
            cursor: pointer;
        }

        >.dropdown-content {
            display: none;
            position: absolute;
            flex-direction: column;
            list-style: none;
            top: 0;
            left: 0;
            margin: 0 100% 0;
            padding: 0;
            background-color: #222222;
            backdrop-filter: blur(5px);
            z-index: 1;

            li {
                margin: 0;
                padding: 0.5rem 1rem;
                min-width: 100px;
                cursor: pointer;

                &:hover {
                    background: #111;
                }
            }
        }

        &:hover>.dropdown-content {
            display: block;
        }
    }

    .dropdown {
        @include dropdown;

        position: relative;
        display: flex;


        .dropdown-content {
            @include dropdown;
        }
    }

    button {
        &.settings {
            margin-right: 2rem;
        }

        &.green {
            border: 1px solid #84ff84;
        }

        &.red {
            border: 1px solid #ee6060;
        }
    }
}
</style>