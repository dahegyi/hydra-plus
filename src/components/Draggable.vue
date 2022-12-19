<template>
    <draggable class="dragArea" tag="ul" :list="blocks" :group="{ name: 'g1' }" item-key="name">
        <template #item="{ element }">
            <li :class="{ focused: focused === element }">
                <strong>
                    <span class="name" @click="onFocus(element)">{{ element.name }}</span>
                    <span class="delete" @click="deleteEffect(element)" />
                </strong>
                <div v-for="(param, index) in element.params" :key="index" class="param-input-container"
                    @click="onFocus(element)">
                    <label>{{ param.name }}</label>
                    <input v-model="param.value" />
                </div>

                <nested-draggable v-if="hasDraggableChild(element.type)" :blocks="element.blocks" :focused="focused"
                    :parent="element" @onFocus="onFocus" />
            </li>
        </template>
    </draggable>
</template>
<script>
import draggable from "vuedraggable";

import { TYPE_SRC, TYPE_COMPLEX } from "../constants";

export default {
    name: "NestedDraggable",

    props: {
        blocks: {
            required: true,
            type: Array
        },

        focused: {
            type: Object,
            default: null
        },

        parent: {
            required: true,
            type: Object
        },
    },

    methods: {
        deleteEffect(element) {
            const { blocks, parent } = this;

            for (const block of blocks) {
                if (block === element) {
                    this.onFocus(parent);

                    return blocks.splice(blocks.indexOf(block), 1);
                }
            }


        },

        hasDraggableChild(type) {
            return type === TYPE_SRC || type === TYPE_COMPLEX;
        },

        onFocus(element) {
            if (this.hasDraggableChild(element.type)) {
                this.$emit("onFocus", element, true);
            } else {
                this.$emit("onFocus", this.parent, true);
            }
        },
    },

    components: {
        draggable
    }
};
</script>

<style lang="scss" scoped>
$darkblue: #02042c;

.dragArea {
    min-height: 40px;
    outline: 1px dashed #ffffff80;
    list-style: none;
    padding: 1px 0 0;
    margin: 0.5rem 0 0;
    background: #00000040;

    li {
        padding: 0.65rem;
        border-bottom: 2px solid #222;
        transition: background 0.02s linear;

        &:hover {
            background: #ffffff25;
        }

        &:last-child {
            border-bottom: none;
        }

        &.focused {
            background: #ffffff40;
        }

        strong {
            display: flex;
            cursor: pointer;
            user-select: none;

            .name {
                width: 100%;
            }

            .delete {
                height: 20px;
                width: 20px;
                position: relative;

                &:before,
                &:after {
                    content: "";
                    position: absolute;
                    border-top: 2px solid #ff7979;
                    width: 12px;
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
            align-items: center;
            margin: 0.2rem 0;

            label {
                margin-right: 1rem;
                user-select: none;
            }

            input {
                width: 60%;
                padding: 0.2rem;
            }
        }
    }
}
</style>