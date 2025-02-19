<script setup>
import { computed } from "vue";
import { CURRENT_VERSION } from "@/constants";
import { getSafeLocalStorage } from "@/utils";
import BaseModal from "./BaseModal";

const showLatestUpdates = computed(
  () => getSafeLocalStorage("welcomeModalLastUpdate") < CURRENT_VERSION,
);
</script>

<template>
  <BaseModal modal-name="WelcomeModal">
    <div v-if="showLatestUpdates">
      <h1>welcome to version 0.9!</h1>
      <p>
        This version may not seem like a big improvement, but it lays down some
        foundational work for where the project is heading.
      </p>
      <p>There are a couple things though that are noticably new:</p>
      <ul>
        <li>new toolbar</li>
        <li>copy, cut, and paste with either the toolbar, or with shortcuts</li>
        <li>context menu for ease of use: right click on any of the blocks</li>
        <li>export your hydra code to a file from the settings modal</li>
        <li>+ also some design and functionality improvements</li>
      </ul>
      <hr />
    </div>

    <div v-else>
      <h1>welcome!</h1>
      <p>
        <strong>hydra+</strong> is a graphical user interface for
        <a href="https://hydra.ojack.xyz/" target="_blank">hydra</a>, a
        javascript library for livecoding visuals.
      </p>
      <p>
        Please refer to the
        <a href="https://hydra.ojack.xyz/api/" target="_blank">hydra api</a> for
        information on how to use the synthatizer.
      </p>
    </div>

    <p>
      Thank you for using hydra+, your feedback, shared via
      <a href="https://github.com/dahegyi/hydra-plus" target="_blank">Github</a>
      or <a href="https://discord.gg/CuEQbm8K" target="_blank">Discord</a> is
      highly appreciated. Also, I'll try to answer any questions you might have.
    </p>

    <br />

    <h2>❤️‍🔥 happy hacking!</h2>
  </BaseModal>
</template>

<style lang="scss" scoped>
h1 {
  margin: 1.2rem auto 1.4rem;
  font-size: 1.7rem;
  font-weight: 700;
}

h2 {
  font-size: 1.2rem;
  font-weight: 600;
}

p {
  margin: 0.4rem 0;
}

ul {
  padding-left: 1.2rem;
  margin: 0.4rem 0;

  li {
    margin: 0.2rem 0;
    list-style-type: disc;
  }
}

hr {
  border: 0;
  border-top: 1px solid #888;
  margin: 1.2rem 0 1rem;
}
</style>
