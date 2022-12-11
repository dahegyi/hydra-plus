<template>
    <div class="container">
        <CodeEditor v-model="code" :hide_header="true" :autofocus="true" width="100%" height="100%" border_radius="0" />
        <a @click="updateAndSend">
            <font-awesome-icon icon="fa-solid fa-share" />
        </a>
        <a @click="update">
            <font-awesome-icon icon="fa-solid fa-play" />
        </a>

        <span class="error">{{ error }}</span>
    </div>
</template>

<script>
import { useBroadcastChannel } from '@vueuse/core';
const { post } = useBroadcastChannel({ name: 'hydra-plus-channel' });

import hljs from "highlight.js";
import CodeEditor from 'simple-code-editor';

export default {
    name: 'Code',

    components: {
        hljs, // keep this as vite cannot handle its module export
        CodeEditor
    },

    data() {
        return {
            code: "osc(10).out()",
            error: null
        }
    },

    methods: {
        update() {
            try {
                eval(this.code);
                this.error = null;
            } catch (error) {
                this.error = error;
            }
        },

        updateAndSend() {
            this.update();
            post(this.code);
        }
    },

    mounted() {
        this._keyListener = function (e) {
            if (e.key === "S" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.update();
            }

            if (e.key === "P" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.updateAndSend();
            }
        };

        document.addEventListener('keydown', this._keyListener.bind(this));
    },

    beforeDestroy() {
        document.removeEventListener('keydown', this._keyListener);
    }
}
</script>
<style lang="scss">
.container {
    a {
        position: absolute;
        right: 0;
        margin: 1rem;
        z-index: 100;
        cursor: pointer;
        font-size: 1.5rem;

        &:nth-child(2) {
            bottom: 0;
        }
    }

    .hljs,
    textarea {
        background: none !important;
        position: absolute !important;
        font-family: monospace !important;
        font-size: 18px !important;
        font-weight: 600;
    }

    .error {
        position: absolute;
        bottom: 0;
        margin: 0.5rem;
    }
}
</style>