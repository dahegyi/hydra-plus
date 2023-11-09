<template>
  <div class="modal-container">
    <div class="modal">
      <h2>welcome!</h2>

      <div class="content">
        <p>
          <strong>hydra+</strong> is a graphical user interface for
          <a href="https://hydra.ojack.xyz/" target="_blank">hydra</a>, a
          javascript library for livecoding visuals.
        </p>
        <p>
          please refer to the
          <a href="https://hydra.ojack.xyz/api/">hydra api</a> for information
          on how to use the synthatizer.
        </p>

        <hr />

        <p>
          it is strongly recommended to use the app on a desktop computer with a
          keyboard.<br />
          the app is not optimized for touchscreen devices.
        </p>

        <hr />

        <h3>usable key combos:</h3>

        <div class="feature">
          <span class="description">update:</span>
          <div>
            <span class="key" data-type="enter">↵</span>
          </div>
        </div>
        <div class="feature">
          <span class="description">undo:</span>
          <div>
            <span class="key">{{ modifierKey }}</span> +
            <span class="key">z</span>
          </div>
        </div>
        <div class="feature">
          <span class="description">redo:</span>
          <div>
            <span class="key">{{ modifierKey }}</span> +
            <span class="key">y</span>
          </div>
          <div>
            <span class="or-text">or</span>
            <span class="key">{{ modifierKey }}</span> +
            <span class="key">shift</span> + <span class="key">z</span>
          </div>
        </div>
        <div class="feature">
          <span class="description">toggle ui visibility:</span>
          <div>
            <span class="key">esc</span>
          </div>
        </div>

        <hr />
        <p>
          <strong>
            please report bugs or feature requests on
            <a
              href="https://github.com/dahegyi/hydra-plus/issues"
              target="_blank"
            >
              github</a
            >.
          </strong>
        </p>

        <button @click="close">close</button>
      </div>
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
  width: 520px;
  h2 {
    margin: 2rem auto 1rem;
  }

  p {
    margin: 8px 0;
    text-align: left;
  }

  .feature {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    padding: 12px 8px 14px;

    &:nth-child(2n) {
      background: #1a1a1a;
    }

    .description {
      flex-grow: 1;
      margin-top: 2px;
      text-align: left;
    }

    .key {
      padding: 6px 10px;
      border-radius: 5px;
      margin: 0 4px;
      background: #333;
      box-shadow: 0 2px 0 #777;
      font-size: 0.9rem;

      &[data-type="enter"] {
        padding: 6px 25px;
      }
    }

    .or-text {
      margin: 0 8px;
    }

    @media screen and (max-width: 500px) {
      flex-direction: column;
      padding-bottom: 20px;

      > div {
        margin-bottom: 20px;

        &:last-child {
          margin-bottom: 0;
        }
      }

      .description {
        margin-bottom: 10px;
        font-weight: bold;
      }

      .key {
        margin: 0;
      }

      .or-text {
        display: none;
      }
    }
  }

  button {
    margin: 16px auto 10px;
  }
}
</style>
