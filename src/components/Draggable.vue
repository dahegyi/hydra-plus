<template>
    <draggable class="dragArea" tag="ul" :list="blocks" :group="{ name: 'g1' }" item-key="name">
        <template #item="{ element }">
            <li>
                <strong>
                    <span>{{ element.name }}</span>
                    <span class="delete" @click="deleteEffect(index)" />
                </strong>
                <div v-for="(param, index) in element.params" :key="index" class="param-input-container">
                    <label :for="param.name">{{ param.name }}</label>
                    <input :id="param.name" v-model="param.value" />
                </div>

                <nested-draggable v-if="element.type === TYPE_SRC" :blocks="element.blocks" />
            </li>
        </template>
    </draggable>
</template>
<script>
import draggable from "vuedraggable";

import { TYPE_SRC } from "../constants";

export default {
    name: "NestedDraggable",

    data() {
        return {
            TYPE_SRC
        }
    },

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
        deleteEffect(index) {
            this.blocks.splice(index, 1);
        }
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
    padding: 0.1rem 0.5rem;
    background: #00000040;



    li {
        background: #ffffff40;
        margin: 0.5rem 0;
        padding: 0.2rem 0.6rem;

        &:first-child() {
            margin-top: 0;
        }

        &:last-child() {
            margin-bottom: 0;
        }

        strong {
            display: flex;
            justify-content: space-between;
        }

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

        .param-input-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 0.2rem 0;

            label {
                margin-right: 1rem;
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