<template>
    <div class="container">
        <h1>hydra+</h1>

        <p>display this tab on a projector and start hacking</p>

        <button @click="openCode"><span>open code editor</span></button>
        <button @click="openGui"><span>open gui</span></button>
    </div>
</template>

<script>
export default {
    methods: {
        openCode() {
            window.open('./code', '_blank');
            this.$router.push({ path: "./visualizer" })
        },

        openGui() {
            window.open('./gui', '_blank');
            this.$router.push({ path: "./visualizer" })
        }
    }
}
</script>

<style lang="scss" scoped>
$rainbow-colors: #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff,
    #ff00c8, #ff0000;
$btn-border-radius: 6px;
$btn-transition: all 0.3s ease-in-out;

.container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    min-height: 100vh;
}

h1, p {
    text-shadow: 0 0 8px #000000ae;
}

button {
    width: 220px;
    height: 60px;
    border: none;
    outline: none;
    cursor: pointer;
    position: relative;
    border-radius: $btn-border-radius;
    margin: 8px 0;
    background: none;

    @mixin button {
        position: absolute;
        background: linear-gradient(45deg, $rainbow-colors);
        background-size: 400%;
        width: 100%;
        left: 0;
        animation: glowing 15s linear infinite;
    }

    @mixin beforeAfter {
        content: "";
        position: absolute;
        height: 100%;
        width: 100%;
        top: 0;
        left: 0;
        border-radius: $btn-border-radius;
        transition: $btn-transition;
    }

    span {
        @include button;
        z-index: 2;
        top: 35%;
        color: transparent;
        font-size: 14px;
        font-weight: 600;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        -webkit-background-clip: text;
        filter: saturate(0.5) brightness(5);
        text-shadow: 0 0 8px #00000090;
    }

    &:before {
        @include button;
        @include beforeAfter;
        z-index: 0;
        filter: blur(10px);
    }

    &:after {
        @include beforeAfter;
        z-index: 1;
        background: #000;
        opacity: 0;
    }

    &:hover {
        &:before {
            filter: blur(4px);
        }

        &:after {
            opacity: 0.2;
            filter: blur(4px);
        }
    }

    &:active {
        &:before {
            filter: blur(1px);
        }

        &:after {
            opacity: 0.4;
            filter: blur(1px);
        }
    }
}


@keyframes glowing {
    0% {
        background-position: 0 0;
    }

    100% {
        background-position: 400% 0;
    }
}
</style>