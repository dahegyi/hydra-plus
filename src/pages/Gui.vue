<template>
    <welcome-modal v-if="isWelcomeModalOpen" @close="closeWelcomeModal" />

    <settings-modal v-if="isSettingsModalOpen" :blocks="blocks" :synthSettings="synthSettings"
        @close="closeSettingsModal" @closeAndSave="saveAndCloseSettingsModal" />

    <div class="playground" @click="removeFocus" />

    <navigation :blocks="blocks" :externalSourceBlocks="externalSourceBlocks" :focused="focused"
        :isSettingsModalOpen="isSettingsModalOpen" :synthSettings="synthSettings" @openSettingsModal="openSettingsModal"
        @onFocus="onFocus" />

    <div>
        <div v-for="(block, index) in blocks" :key="'src-block-' + index" :id="'src-block-' + index"
            :class="['source', { focused: focused === block }]">
            <div @click="onFocus(index)">
                <strong class="output-header" @mousedown="(e) => moveBlock(e, index, block.type)">
                    <span>o{{ index }} - {{ block.name }}</span>
                    <div>
                        <span :class="['activate', { active: synthSettings.output === index }]"
                            @click="setActiveOutput(index)" />
                        <span class="delete" @click="deleteSource(index)" />
                    </div>
                </strong>
                <div v-if="block.name === 'src'" class="param-input-container">
                    <label>{{ block.params[0].name }}</label>
                    <select v-model="block.params[0].value">
                        <option v-for="source, sIndex in externalSourceBlocks" :value="'s' + sIndex">
                            s{{ sIndex }} - {{ source.name }}
                        </option>
                        <option v-for="output, oIndex in blocks" :value="'o' + oIndex">
                            o{{ oIndex }} - {{ output.name }}
                        </option>
                    </select>
                </div>
                <div v-else v-for="(param, paramIndex) in block.params" :key="paramIndex" class="param-input-container">
                    <label>{{ param.name }}</label>
                    <input type="text" v-model="param.value" />
                </div>
            </div>

            <nested-draggable :blocks="block.blocks" :outputBlocks="blocks" :externalSourceBlocks="externalSourceBlocks"
                :focused="focused" :parent="block" @onFocus="onFocus" />
        </div>

        <div v-for="(block, index) in externalSourceBlocks" :key="'ext-block-' + index" :id="'ext-block-' + index"
            class="source external">
            <strong class="output-header" @mousedown="(e) => moveBlock(e, index, block.type)">
                <span>s{{ index }} - {{ block.name }}</span>
                <div>
                    <span class="delete" @click="deleteExternal(index)" />
                </div>
            </strong>
            <div v-for="(param, paramIndex) in block.params" :key="paramIndex" class="param-input-container">
                <label :for="paramIndex">{{ param.name }}</label>
                <input :id="index + param.name + paramIndex" type="text" v-model="param.value" />
            </div>
        </div>
    </div>
</template>

<script>
import { useBroadcastChannel } from '@vueuse/core';
const { post } = useBroadcastChannel({ name: 'hydra-plus-channel' });

import { INITIAL_BLOCKS, TYPE_EXTERNAL, TYPE_SRC } from "../constants";

import WelcomeModal from "../components/WelcomeModal.vue";
import SettingsModal from "../components/SettingsModal.vue";
import Navigation from "../components/Navigation.vue";
import NestedDraggable from "../components/Draggable.vue";

export default {
    Name: 'Gui',

    components: {
        WelcomeModal,
        SettingsModal,
        Navigation,
        NestedDraggable
    },

    data() {
        return {
            blocks: [],
            externalSourceBlocks: [],
            error: null,
            focused: null,
            focusedBlock: null,
            synthSettings: {
                bpm: 30,
                speed: 1,
                output: null,
                fps: 60,
                resolution: 1,
            },
            isWelcomeModalOpen: false,
            isSettingsModalOpen: false,
        }
    },

    mounted() { // @TODO refactor this
        // show welcome modal
        if (localStorage.getItem("welcomeModalClosed")) {
            this.isWelcomeModalOpen = false;
        } else {
            this.isWelcomeModalOpen = true;
        }

        // load stuff from local storage
        if (localStorage.getItem("externalSourceBlocks")) {
            this.externalSourceBlocks = JSON.parse(localStorage.getItem("externalSourceBlocks"));
        }

        if (localStorage.getItem("blocks")) {
            this.blocks = JSON.parse(localStorage.getItem("blocks"));
        } else {
            this.blocks = JSON.parse(INITIAL_BLOCKS);
        }

        if (localStorage.getItem("synthSettings")) {
            this.synthSettings = JSON.parse(localStorage.getItem("synthSettings"));
        }
    },

    updated() {
        // move parent blocks and external source blocks to their position
        this.blocks.map((block, index) => {
            this.moveBlock(block, index, TYPE_SRC, block.position);
        });

        this.externalSourceBlocks.map((block, index) => {
            this.moveBlock(block, index, TYPE_EXTERNAL, block.position);
        });
    },

    methods: {
        moveBlock(e, index, type, position) {
            let div;

            if (type === TYPE_SRC) {
                div = document.getElementById("src-block-" + index);
            } else { // TYPE_EXTERNAL
                div = document.getElementById("ext-block-" + index);
            }

            const divRect = div.getBoundingClientRect();

            const offsetX = e.clientX - divRect.left;
            const offsetY = e.clientY - divRect.top;

            if (position) {
                return div.style.transform = `translate(${position.x}px, ${position.y}px)`;
            }

            const move = (e) => {
                const x = e.clientX - offsetX;
                const y = e.clientY - offsetY;

                div.style.transform = `translate(${x}px, ${y}px)`;


                if (type === TYPE_SRC) {
                    this.blocks[index].position = { x, y };
                } else {
                    this.externalSourceBlocks[index].position = { x, y };
                }
            }

            const up = () => {
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', up);
            }

            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);
        },

        setActiveOutput(index) {
            this.synthSettings.output = index;
        },

        deleteSource(index) {
            this.blocks.splice(index, 1);

            if (this.blocks.length === 0) {
                this.synthSettings.output = null;
            } else {
                this.synthSettings.output = this.blocks.length - 1;
            }
        },

        deleteExternal(index) {
            this.externalSourceBlocks.splice(index, 1);
        },

        onFocus(index, fromChildComponent) {
            if (fromChildComponent) {
                this.focused = index;
            } else {
                this.focused = this.blocks[index];
                this.focusedBlock = this.focused;
            }
        },

        removeFocus() {
            this.focused = null;
            this.focusedBlock = this.focused;
        },

        closeWelcomeModal() {
            this.isWelcomeModalOpen = false;
            localStorage.setItem("welcomeModalClosed", true);
        },

        openSettingsModal() {
            this.isSettingsModalOpen = true;
        },

        closeSettingsModal() {
            this.isSettingsModalOpen = false;
        },

        saveAndCloseSettingsModal() {
            eval(`bpm = ${this.synthSettings.bpm}`);
            post(`bpm = ${this.synthSettings.bpm}`);

            eval(`speed = ${this.synthSettings.speed}`);
            post(`speed = ${this.synthSettings.speed}`);

            this.isSettingsModalOpen = false;
        },
    }
}
</script>

<style lang="scss" scoped>
$darkblue: #02042c;

.playground {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
}

.source {
    position: absolute;
    display: flex;
    flex-direction: column;
    width: fit-content;
    min-width: 300px;
    padding: 1rem;
    border-radius: 10px;
    background: #22222280;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);

    .output-header {
        color: $darkblue;
        padding: 6px;
        display: flex;
        justify-content: space-between;
        background: #fff;
        border: 1px solid $darkblue;
        border-radius: 6px;
        margin-bottom: 0.5rem;
        cursor: move;

        $iconSize: 21px;

        .activate,
        .delete {
            position: absolute;
            height: $iconSize;
            width: $iconSize;
            cursor: pointer;
        }

        .activate {
            right: calc(2 * $iconSize);

            &:after {
                content: "";
                position: absolute;
                border: 4px solid $darkblue;
                height: calc($iconSize / 3);
                width: calc($iconSize / 3);
                border-radius: 50%;
                top: 25%;
                left: 25%;
            }

            &.active {
                &:after {
                    border-color: #f55858;
                }
            }
        }

        .delete {
            right: $iconSize;

            &:before,
            &:after {
                content: "";
                position: absolute;
                border-top: 3px solid $darkblue;
                width: 16px;
                top: 50%;
                left: 10%;
            }

            &:before {
                transform: rotate(45deg);
            }

            &:after {
                transform: rotate(-45deg);

            }
        }
    }

    &:not(.external) {
        $offset-top: -200%;
        $bottom-color: #38383880;
        $offset-bottom: 150%;

        &:nth-child(1) {
            $color: #fff70080;
            background: linear-gradient(180deg, $color $offset-top, $bottom-color $offset-bottom);

            &.focused {
                background: linear-gradient(180deg, $color calc($offset-top / 2), $bottom-color calc($offset-bottom * 2));
            }

            .output-header {
                background: $color;
            }
        }

        &:nth-child(2) {
            $color: #b8f77080;
            background: linear-gradient(180deg, $color $offset-top, $bottom-color $offset-bottom);

            &.focused {
                background: linear-gradient(180deg, $color calc($offset-top / 2), $bottom-color calc($offset-bottom * 2));
            }

            .output-header {
                background: $color;
            }
        }

        &:nth-child(3) {
            $color: #3bd5f080;
            background: linear-gradient(180deg, $color $offset-top, $bottom-color $offset-bottom);

            &.focused {
                background: linear-gradient(180deg, $color calc($offset-top / 2), $bottom-color calc($offset-bottom * 2));
            }

            .output-header {
                background: $color;
            }
        }

        &:nth-child(4) {
            $color: #ff8fec80;
            background: linear-gradient(180deg, $color $offset-top, $bottom-color $offset-bottom);

            &.focused {
                background: linear-gradient(180deg, $color calc($offset-top / 2), $bottom-color calc($offset-bottom * 2));
            }

            .output-header {
                background: $color;
            }
        }
    }

    &.external {
        .output-header {
            color: #000;
            background: #f1a3a3;
        }
    }
}
</style>