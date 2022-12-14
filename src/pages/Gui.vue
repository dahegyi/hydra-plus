<template>
    <div class="playground" @click="removeFocus" />

    <navigation :blocks="blocks" :focused="focused" :synthSettings="synthSettings" @onFocus="onFocus" />

    <div>
        <div v-for="(block, index) in blocks" :key="index" :id="'block' + index"
            :class="['source', { focused: focused === block }]">
            <div @click="onFocus(index)">
                <strong class="output-header" @mousedown="(e) => moveSource(e, index)">
                    <span>o{{ index }} - {{ block.name }}</span>
                    <div>
                        <span :class="['activate', { active: synthSettings.output.current === index }]"
                            @click="setActiveOutput(index)" />
                        <span class="delete" @click="deleteSource(index)" />
                    </div>
                </strong>
                <div v-for="(param, paramIndex) in block.params" :key="paramIndex" class="param-input-container">
                    <label :for="paramIndex">{{ param.name }}</label>
                    <input :id="index + param.name + paramIndex" type="text" v-model="param.value" />
                </div>
            </div>

            <nested-draggable :blocks="block.blocks" :focused="focused" :parent="block" @onFocus="onFocus" />
        </div>
    </div>
</template>

<script>
import { INITIAL_BLOCKS } from "../constants";

import Navigation from "../components/Navigation.vue";
import NestedDraggable from "../components/Draggable.vue";

export default {
    Name: 'Gui',

    components: {
        Navigation,
        NestedDraggable
    },

    data() {
        return {
            blocks: [],
            error: null,
            focused: null,
            synthSettings: { // @TODO fix this
                bpm: { current: 30, previous: 30 },
                speed: { current: 1, previous: 1 },
                output: { current: null, previous: null },
            }
        }
    },

    mounted() {
        // load blocks from local storage
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
        // move parent blocks to their position
        this.blocks.map((block, index) => {
            this.moveSource(block, index, block.position);
        });
    },

    computed: {},

    methods: {
        moveSource(e, index, position) {
            const div = document.getElementById("block" + index);
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

                this.blocks[index].position = { x, y };
            }

            const up = () => {
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', up);
            }

            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);
        },

        setActiveOutput(index) {
            this.synthSettings.output = { current: index, previous: index };

            this.onFocus(this.blocks.index);
        },

        deleteSource(index) {
            this.blocks.splice(index, 1);

            if (this.blocks.length === 0) {
                this.synthSettings.output = { current: null, previous: null };
            } else {
                this.synthSettings.output = { current: this.blocks.length - 1, previous: this.blocks.length - 1 };
            }
        },

        onFocus(index, fromChildComponent) {
            if (fromChildComponent) {
                this.focused = index;
            } else {
                this.focused = this.blocks[index];
            }

            // console.log('focus in', this.focused);
        },

        removeFocus() {
            this.focused = null;
            // console.log('focus out', this.focused);
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
    background: #22222260;
    backdrop-filter: blur(5px);

    &.focused {
        background: #11111180;
    }

    .output-header {
        color: $darkblue;
        padding: 6px;
        display: flex;
        justify-content: space-between;
        border: 1px dashed $darkblue;
        margin-bottom: 0.5rem;
        cursor: move;

        $iconSize: 24px;

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
                height: 8px;
                width: 8px;
                border-radius: 50%;
                top: 4px;
                left: 4px;
            }

            &.active {
                &:after {
                    border-color: #f54646;
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
            background: #f7a06d;
        }
    }

    &:nth-child(3) {
        .output-header {
            background: #74eb74;
        }
    }

    &:nth-child(4) {
        .output-header {
            background: #9696ff;
        }
    }
}
</style>