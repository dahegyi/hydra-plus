<template>
    <div class="code-container">
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