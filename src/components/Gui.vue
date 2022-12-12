<template>
    <div class="background" @click="removeFocus" />
    <!-- navigation -->
    <div class="navigation">
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
            <strong>
                {{ outputName }} - {{ focus.name }}
            </strong>
            <select v-model="selectedEffect">
                <option disabled value="">geometry functions</option>
                <option v-for="fn in geometryFunctions" :value="fn" @change="selectEffect(fn)">
                    {{ fn.name }}
                </option>
            </select>
            <select v-model="selectedEffect">
                <option disabled value="">color functions</option>
                <option v-for="fn in colorFunctions" :value="fn" @change="selectEffect(fn)">
                    {{ fn.name }}
                </option>
            </select>
            <select v-model="selectedEffect">
                <option disabled value="">modulate functions</option>
                <option v-for="fn in modulateFunctions" :value="fn" @change="selectModulation(fn)">
                    {{ fn.name }}
                </option>
            </select>
            <button @click="addEffect">add effect</button>
        </div>

        <div>
            <button @click="isSettingsModalOpen = true" class="settings">synth settings</button>
            <button @click="update" class="green">update</button>
            <button @click="updateAndSend" class="red">send</button>
        </div>
    </div>

    <!-- playground -->
    <div v-for="(block, index) in blocks" :key="index" :id="'block' + index" class="source">
        <div @click="onFocus(index)">
            <strong class="output-header" @mousedown="(e) => moveSource(e, index)">
                <span>o{{ index }} - {{ block.name }}</span>
                <span class="delete" @click="deleteSource(index)" />
            </strong>
            <div v-for="(param, paramIndex) in block.params" :key="paramIndex" class="param-input-container">
                <label :for="paramIndex">{{ param.name }}</label>
                <input :id="index + param.name + paramIndex" type="text" v-model="param.value" />
            </div>
        </div>

        <nested-draggable :blocks="block.blocks" @onFocus="onFocus" />
    </div>

    <!-- settings modal -->
    <div class="settings-modal" v-if="isSettingsModalOpen">
        <h1>settings</h1>
        <div class="row">
            <label for="speed">speed</label>
            <input type="text" id="speed" v-model="synthSettings.speed.current" />
        </div>
        <div class="row">
            <label for="bpm">bpm</label>
            <input type="text" id="bpm" v-model="synthSettings.bpm.current" />
        </div>

        <div>
            <button @click="closeSettingsModal">cancel</button>
            <button @click="saveAndCloseSettingsModal">save and close</button>
        </div>
    </div>
</template>

<script>
import { useBroadcastChannel } from '@vueuse/core';
const { post } = useBroadcastChannel({ name: 'hydra-plus-channel' });

import { deepCopy, flatten } from '../utils/object-utils';

import {
    TYPE_SRC,
    TYPE_SIMPLE,
    TYPE_MODULATION,
    SOURCE_FUNCTIONS,
    GEOMETRY_FUNCTIONS,
    COLOR_FUNCTIONS,
    MODULATE_FUNCTIONS
} from '../constants';

import NestedDraggable from "./Draggable.vue";

export default {
    Name: 'Gui',

    components: {
        NestedDraggable
    },

    data() {
        return {
            blocks: [],
            error: null,
            focus: null,
            selectedSource: "",
            selectedEffect: {
                name: "",
                type: ""
            },
            isSettingsModalOpen: false,
            synthSettings: {
                bpm: { current: 30, previous: 30 },
                speed: { current: 1, previous: 1 },
            }
        }
    },

    computed: {
        outputName() {
            return `o${this.blocks.findIndex((block) => block === this.focus)}`;
        },

        isSourceSelectVisible() {
            return (this.focus?.type !== TYPE_SRC && this.focus?.type !== TYPE_SIMPLE);
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

        modulateFunctions() {
            return MODULATE_FUNCTIONS.map((fn) => ({ ...fn, type: TYPE_MODULATION }));
        },
    },

    methods: {
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
                { ...this.selectedSource, type: TYPE_SRC, blocks: [] }
            );

            if (!this.focus && this.blocks.length < 4) {
                this.blocks.push(copiedObject);

                this.focus = this.blocks[this.blocks.length - 1];
                this.selectedSource = "";
            } else if (this.focus) {
                this.focus.blocks.push(copiedObject);
            }

        },

        moveSource(e, index) {
            const div = document.getElementById("block" + index);
            const divRect = div.getBoundingClientRect();

            const offsetX = e.clientX - divRect.left;
            const offsetY = e.clientY - divRect.top;

            const move = (e) => {
                const x = e.clientX - offsetX;
                const y = e.clientY - offsetY;

                div.style.transform = `translate(${x}px, ${y}px)`;
            }

            const up = () => {
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', up);
            }

            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);
        },

        deleteSource(index) {
            this.blocks.splice(index, 1);
            this.focus = null;
        },

        /**
         * Adds geometry block to the block that is in focus.
         */
        addEffect() {
            const { focus, selectedEffect } = this;

            if (selectedEffect.name && focus) {
                focus.blocks.push(
                    deepCopy(selectedEffect)
                );
            }

            if (selectedEffect.type === TYPE_MODULATION) {
                this.focus = focus.blocks[focus.blocks.length - 1];
            }

            this.selectedEffect = {
                effect: "",
                type: ""
            };
        },

        onFocus(index, fromChildComponent) {
            if (fromChildComponent) {
                this.focus = index;
            } else {
                this.focus = this.blocks[index];
            }

            console.log('focus in', this.focus);
        },

        removeFocus() {
            this.focus = null;
            // console.log('focus out', this.focus);
        },

        closeSettingsModal() {
            // @TODO ask user if they want to save changes
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
                codeString = flatten(this.blocks[0]);
            }

            console.log(this.blocks, codeString);

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
                const codeString = flatten(this.blocks[0]);
                post(`${codeString}.out()`);
            }
        }
    }
}
</script>

<style lang="scss" scoped>
$darkblue: #02042c;

.background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

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

.source {
    position: absolute;
    display: flex;
    flex-direction: column;
    width: fit-content;
    min-width: 300px;
    padding: 1rem 1rem 0.5rem;
    border-radius: 10px;
    background: #22222260;
    backdrop-filter: blur(5px);
    transform: translate(20px, 60px);

    .output-header {
        color: $darkblue;
        padding: 6px;
        display: flex;
        justify-content: space-between;
        border: 1px dashed $darkblue;
        margin-bottom: 0.5rem;
        cursor: move;

        .delete {
            height: 24px;
            width: 24px;
            cursor: pointer;
            position: relative;

            &:before,
            &:after {
                content: "";
                position: absolute;
                border-top: 3px solid $darkblue;
                width: 16px;
                top: 10px;
                left: 5px;
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
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;

        label {
            margin-right: 1rem;
            user-select: none;
        }

        input {
            width: 60%;
            padding: 0.2rem;
            border: 1px solid #00000040;
            border-radius: 0;
            background: #000000aa;
        }
    }

    &:nth-child(1) {
        .output-header {
            background: #ffff56;
        }
    }

    &:nth-child(2) {
        .output-header {
            background: #ee6060;
        }
    }

    &:nth-child(3) {
        .output-header {
            background: #84ff84;
        }
    }

    &:nth-child(4) {
        .output-header {
            background: #9696ff;
        }
    }
}

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

        input {
            width: 60%;
            padding: 0.2rem;
            border: 1px solid #00000040;
            border-radius: 0;
            background: #000000aa;
        }
    }
}
</style>