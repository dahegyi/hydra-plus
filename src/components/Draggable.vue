<template>
    <draggable class="dragArea" tag="ul" :list="blocks" :group="{ name: 'g1' }" item-key="name">
        <template #item="{ element }">
            <li>
                <div>
                    <strong>
                        <span>{{ element.name }}</span>
                        <span class="delete" @click="deleteEffect(element)" />
                    </strong>
                    <div v-for="(param, index) in element.params" :key="index" class="param-input-container"
                        @click="onFocus(element)">
                        <label :for="param.name">{{ param.name }}</label>
                        <input :id="param.name" v-model="param.value" />
                    </div>
                </div>

                <nested-draggable v-if="hasDraggableChild(element.type)" :blocks="element.blocks" @onFocus="onFocus" />
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
        params: {
            default: [],
            type: Array
        },

        blocks: {
            required: true,
            type: Array
        }
    },

    methods: {
        deleteEffect(element) {
            for (const block of this.blocks) {
                if (block === element) {
                    return this.blocks.splice(this.blocks.indexOf(block), 1);
                }
            }
        },

        hasDraggableChild(type) {
            return type === TYPE_SRC || type === TYPE_COMPLEX;
        },

        onFocus(element) {

            console.log(element)
            if (this.hasDraggableChild(element.type)) {
                this.$emit("onFocus", element, true);
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
    min-height: 50px;
    outline: 1px dashed;
    list-style: none;
    padding: 0.4rem;
    margin: 0.5rem 0;
    background: #00000040;

    li {
        background: #ffffff40;
        padding: 0.2rem 0.6rem;

        strong {
            display: flex;
            justify-content: space-between;
            cursor: pointer;
            user-select: none;

            .delete {
                height: 24px;
                width: 24px;
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
            align-items: center;
            margin: 0.2rem 0;

            label {
                margin-right: 1rem;
                user-select: none;
            }

            input {
                width: 60%;
                padding: 0.2rem;
                border: 1px solid #00000040;
                border-radius: 0;
                background: #00000040;
            }
        }
    }
}
</style>