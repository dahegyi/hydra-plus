<template>
  <div class="modal">
    <h2>welcome!</h2>

    <p>
      hydra+ is a graphical user interface for
      <a href="https://hydra.ojack.xyz/" target="_blank">hydra</a>, a javascript
      library for livecoding visuals.<br />
      extra features are planned, but for now it's just a wrapper around hydra.
    </p>
    <p>
      please refer to the
      <a href="https://hydra.ojack.xyz/api/">hydra api</a> for information on
      how to use the synthatizer.
    </p>
    <hr />
    <p>
      <strong>
        this is a work in progress. please report any bugs or feature requests
        on
        <a href="https://github.com/dahegyi/hydra-plus/issues" target="_blank"
          >github</a
        >.
      </strong>
    </p>

    <button @click="close">close</button>
  </div>
</template>
<script>
export default {
  name: "WelcomeModal",

  emits: ["close"],

  methods: {
    close() {
      this.$emit("close");
    },
  },
};
</script>

<style lang="scss" scoped>
h2 {
  margin-top: 0.5rem;
}

p {
  margin: 0.5rem 0;
}

button {
  margin-top: 1rem;
}
</style>
