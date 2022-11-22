<template>
    <draggable class="dragArea" tag="ul" :list="blocks" :group="{ name: 'g1' }" item-key="name">
        <template #item="{ element }">
            <li>
                <p>{{ element.name }}</p>
                <div v-for="(param, index) in element.params" :key="index">
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

    components: {
        draggable
    }
};
</script>

<style scoped>
.dragArea {
    min-height: 50px;
    outline: 1px dashed;
    list-style: none;
    padding: 0.33rem 0 0.33rem 0.66rem;
    background: #ffffff10;
}
</style>