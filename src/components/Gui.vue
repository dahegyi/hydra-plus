<template>
    <select v-model="selectedSource">
        <option disabled value="">select source</option>
        <option v-for="source in sources" :value="source" @change="selectedEffect = source">
            {{ source.name }}
        </option>
    </select>
    <button @click="addSource">add source</button>

    <button @click="update">update</button>


    <div v-for="(block, index) in blocks" :key="index">
        <strong>o{{ index }} - {{ block.name }}</strong>
        <div v-for="(param, index) in block.params" :key="index">
            {{ param.name }}
            <input type="text" v-model="param.value" />
        </div>
        <select v-model="selectedEffect">
            <option disabled value="">select geometry</option>
            <option v-for="geometry in geometryFunctions" :value="geometry" @change="selectedEffect = geometry">
                {{ geometry.name }}
            </option>
        </select>
        <button @click="addEffect(block, TYPE_GEO)">add geometry</button>
        <select v-model="selectedEffect">
            <option disabled value="">select color</option>
            <option v-for="color in colorFunctions" :value="color" @change="selectedEffect = color">
                {{ color.name }}
            </option>
        </select>
        <button @click="addEffect(block, TYPE_COL)">add color</button>
        <nested-draggable :blocks="block.blocks" />
    </div>
</template>

<script>
// import { useBroadcastChannel } from '@vueuse/core';
// const { post } = useBroadcastChannel({ name: 'hydra-plus-channel' });

import NestedDraggable from './Draggable.vue';

import {
    TYPE_SRC,
    TYPE_GEO,
    TYPE_COL,
    SOURCE_FUNCTIONS,
    GEOMETRY_FUNCTIONS,
    COLOR_FUNCTIONS,
    MODULATE_FUNCTIONS
} from '../constants';

import { deepCopy, flatten } from '../utils/object-utils';

export default {
    components: {
        NestedDraggable
    },

    data() {
        return {
            blocks: [],
            error: null,
            sources: SOURCE_FUNCTIONS,
            geometryFunctions: GEOMETRY_FUNCTIONS,
            colorFunctions: COLOR_FUNCTIONS,
            modulateFunctions: MODULATE_FUNCTIONS,
            selectedSource: {},
            selectedEffect: {}
        }
    },

    methods: {
        /**
         * Adds source to the main code block. Deep copy is needed because we want
         * to handle the input parameters differently for different sources.
         */
        addSource() {
            this.selectedSource !== {} && this.blocks.push(
                deepCopy(
                    { ...this.selectedSource, type: TYPE_SRC, blocks: [] }
                )

            );
        },

        /**
         * Adds geometry block to parent block
         * @param {object} parent
         */
        addEffect(parent, type) {
            this.selectedEffect !== {} && parent.blocks.push(
                deepCopy(
                    { ...this.selectedEffect, type: type, blocks: [] }
                )

            );

            this.selectedEffect = {};
        },

        update() {
            const codeString = flatten(this.blocks[0]);

            console.log(this.blocks, codeString);

            try {
                eval(`${codeString}.out()`);
                this.error = null;
            } catch (error) {
                this.error = error;
            }
        }

        // updateAndSend() {
        //     this.update();
        //     post(this.code);
        // }
    }
}
</script>