<template>
  <div class="modal-container">
    <div class="modal">
      <h2>welcome!</h2>

      <p>
        <strong>hydra+</strong> is a graphical user interface for
        <a href="https://hydra.ojack.xyz/" target="_blank">hydra</a>, a
        javascript library for livecoding visuals.
      </p>
      <p>
        please refer to the
        <a href="https://hydra.ojack.xyz/api/">hydra api</a> for information on
        how to use the synthatizer.
      </p>

      <hr />

      <p>
        it is strongly recommended to use the app on a desktop computer with a
        keyboard.<br />
        <strong>the app is not optimized for touchscreen devices.</strong>
      </p>

      <hr />

      <h4>usable key combos:</h4>

      <div class="feature">
        <span class="description">update:</span>
        <span class="key" data-type="enter">↵</span>
      </div>
      <div class="feature">
        <span class="description">undo:</span>
        <span class="key">{{ modifierKey }}</span> + <span class="key">z</span>
      </div>
      <div class="feature">
        <span class="description">redo:</span>
        <span class="key">{{ modifierKey }}</span> + <span class="key">y</span>
        <span class="or-text">or</span>
        <span class="key">{{ modifierKey }}</span> +
        <span class="key">shift</span> + <span class="key">z</span>
      </div>
      <div class="feature">
        <span class="description">toggle ui visibility:</span>
        <span class="key">esc</span>
      </div>

      <hr />
      <p>
        please report bugs or feature requests on
        <a href="https://github.com/dahegyi/hydra-plus/issues" target="_blank">
          github </a
        >.
      </p>

      <button @click="close">close</button>
    </div>
  </div>
</template>
<script>
export default {
  emits: ["close"],

  computed: {
    modifierKey() {
      return /Macintosh|Mac OS X/i.test(navigator.userAgent) ? "⌘" : "ctrl";
    },
  },

  methods: {
    close() {
      this.$emit("close");
    },
  },
};
</script>

<style lang="scss" scoped>
.modal {
  align-items: start;

  h2 {
    margin: 0.5rem auto 1rem;
  }

  p {
    margin: 0.5rem 0;
    text-align: left;
  }

  .feature {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    padding: 12px 8px;

    &:nth-child(2n) {
      background: #1a1a1a;
    }

    .description {
      flex-grow: 1;
      text-align: left;
    }

    .key {
      padding: 2px 10px;
      border-radius: 5px;
      margin: 0 5px;
      background: #333;
      box-shadow: 0 2px 0 #999;
      font-size: 0.9rem;

      &[data-type="enter"] {
        padding: 2px 25px;
      }
    }

    .or-text {
      margin: 0 6px;
    }
  }

  button {
    margin: 1rem auto 0;
  }
}
</style>
