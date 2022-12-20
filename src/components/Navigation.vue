<template>
    <div class="navigation">
        <div>
            <strong v-if="focused">{{ outputName }}</strong>

            <div class="dropdown">
                <button>new {{ isAddSourceVisible ? 'source' : 'effect' }}</button>
                <ul class="dropdown-content">
                    <li v-if="isAddSourceVisible" v-for="source in sources" @click="addSource(source)">
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

                    <li v-if="isExternalSourceVisible" v-for="external in externalSources" class="external"
                        @click="addExternal(external)">
                        {{ external.name }}
                    </li>
                </ul>
            </div>
        </div>

        <div>
            <button @click="openSettingsModal" class="settings">synth settings</button>
            <button @click="update" :disabled="isSettingsModalOpen" class="green">update</button>
            <button @click="updateAndSend" :disabled="isSettingsModalOpen" class="red">send</button>
        </div>
    </div>
</template>
<script>
import { useBroadcastChannel } from '@vueuse/core';
const { post } = useBroadcastChannel({ name: 'hydra-plus-channel' });

import { deepCopy, flattenExternal, flatten } from '../utils/object-utils';

import {
    TYPE_SRC,
    TYPE_EXTERNAL,
    TYPE_SIMPLE,
    TYPE_COMPLEX,
    SOURCE_FUNCTIONS,
    GEOMETRY_FUNCTIONS,
    COLOR_FUNCTIONS,
    BLEND_FUNCTIONS,
    MODULATE_FUNCTIONS,
    EXTERNAL_SOURCE_FUNCTIONS
} from "../constants";

export default {
    name: "Navigation",

    emits: ["openSettingsModal", "onFocus"],

    props: {
        blocks: {
            type: Array,
            default: []
        },

        externalSourceBlocks: {
            type: Array,
            default: []
        },

        focused: {
            type: Object,
            default: null
        },

        isSettingsModalOpen: {
            type: Boolean,
            default: false
        },

        synthSettings: {
            type: Object,
            default: {}
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

        isAddSourceVisible() {
            return (this.focused?.type !== TYPE_SRC && this.focused?.type !== TYPE_SIMPLE);
        },

        isExternalSourceVisible() {
            return this.isAddSourceVisible && this.externalSourceBlocks.length < 4;
        },

        sources() {
            return SOURCE_FUNCTIONS.map((fn) => ({ ...fn, type: TYPE_SRC }));
        },

        externalSources() {
            return EXTERNAL_SOURCE_FUNCTIONS.map((fn) => ({ ...fn, type: TYPE_EXTERNAL }));
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
                { name: "geometry", fns: this.geometryFunctions },
                { name: "color", fns: this.colorFunctions },
                { name: "blend", fns: this.blendFunctions },
                { name: "modulate", fns: this.modulateFunctions },
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
                this.blocks.push(deepCopy(copiedObject));

                this.onFocus(this.blocks[this.blocks.length - 1]);

                this.synthSettings.output = { current: this.blocks.length - 1, previous: this.blocks.length - 1 };
            } else if (this.focused) {
                this.focused.blocks.push(deepCopy(copiedObject));
            }
        },

        addExternal(source) {
            this.externalSourceBlocks.push(deepCopy({ ...source, type: TYPE_EXTERNAL, position: { x: 20, y: 60 } }));
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
                this.onFocus(
                    this.focused.blocks[this.focused.blocks.length - 1]
                );
            }
        },

        openSettingsModal() {
            this.$emit("openSettingsModal");
        },

        update() {
            let codeString = "";

            if (this.blocks.length === 0) {
                codeString = "hush()";
            } else {
                if (!this.synthSettings.output.current) {
                    this.synthSettings.output.current = 0;
                    this.synthSettings.output.previous = 0;
                }

                for (let i = 0; i < this.externalSourceBlocks.length; i++) {
                    codeString += flattenExternal(this.externalSourceBlocks[i], i);
                }

                for (let i = 0; i < this.blocks.length; i++) {
                    codeString += `${flatten(this.blocks[i])}.out(o${i})\n`;
                }

                codeString += `window.hydra.render(o${this.synthSettings.output.current})`;
            }

            // console.log(this.blocks, codeString);

            try {
                eval(codeString);
                this.error = null;

                return codeString;
            } catch (error) {
                this.error = error;
                console.error(error);
            }
        },

        updateAndSend() {
            const codeString = this.update();

            if (codeString) {
                post(codeString);

                localStorage.setItem("externalSourceBlocks", JSON.stringify(this.externalSourceBlocks));
                localStorage.setItem("blocks", JSON.stringify(this.blocks));
                localStorage.setItem("synthSettings", JSON.stringify(this.synthSettings));
            }
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
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
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
            background-color: #222;
            z-index: 1;

            li {
                margin: 0;
                padding: 0.5rem 1rem;
                min-width: 100px;
                cursor: pointer;

                &.external {
                    background-color: #333;

                }

                &:hover {
                    background-color: #111;
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