<template>
    <div class="background" @click="removeFocus" />

    <navigation :blocks="blocks" :focus="focus" @onFocus="onFocus" />

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
</template>

<script>
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
            focus: null,
        }
    },

    mounted() {
        if (localStorage.getItem("blocks")) {
            this.blocks = JSON.parse(localStorage.getItem("blocks"));
        }
    },

    computed: {},

    methods: {
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

            if (this.blocks.length === 0) {
                this.synthSettings.output = { current: null, previous: null };
            } else {
                this.synthSettings.output = { current: this.blocks.length - 1, previous: this.blocks.length - 1 };
            }

            this.focus = null;
        },

        onFocus(index, fromChildComponent) {
            if (fromChildComponent) {
                this.focus = index;
            } else {
                this.focus = this.blocks[index];
            }

            // console.log('focus in', this.focus);
        },

        removeFocus() {
            this.focus = null;
            // console.log('focus out', this.focus);
        },
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
</style>